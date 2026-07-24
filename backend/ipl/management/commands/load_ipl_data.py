import os
import re
import glob
import pandas as pd
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from ipl.models import Match, BattingRecord, BowlingRecord, MilestoneRecord

class Command(BaseCommand):
    help = 'Ingest IPL CSV data from backend/data/ into SQLite database'

    def handle(self, *args, **options):
        data_dir = os.path.join(settings.BASE_DIR, 'data')
        if not os.path.exists(data_dir):
            self.stdout.write(self.style.ERROR(f"Data directory not found at {data_dir}"))
            return

        self.stdout.write("Starting IPL data ingestion...")

        # 1. Load Matches
        self.ingest_matches(data_dir)

        # 2. Load Batting Records (Most Runs)
        self.ingest_batting_records(data_dir)

        # 3. Load Bowling Records (Most Wickets)
        self.ingest_bowling_records(data_dir)

        # 4. Supplement Bowling Records (Best Bowling Economy Innings)
        self.supplement_bowling_economy(data_dir)

        # 5. Load Milestone Records (Fastest Centuries & Fifties)
        self.ingest_milestones(data_dir)

        self.stdout.write(self.style.SUCCESS("IPL Ingestion Completed Successfully!"))

    def normalize_cols(self, df):
        df.columns = [col.strip().lower().replace(' ', '_').replace('.', '_') for col in df.columns]
        return df

    def parse_int(self, val, default=0):
        if pd.isna(val) or val == '' or str(val).strip() == '-' or str(val).lower() == 'na':
            return default
        try:
            return int(float(val))
        except:
            return default

    def parse_float(self, val, default=0.0):
        if pd.isna(val) or val == '' or str(val).strip() == '-' or str(val).lower() == 'na':
            return default
        try:
            return float(val)
        except:
            return default

    def parse_date(self, val):
        if pd.isna(val) or val == '' or str(val).strip() == '-' or str(val).lower() == 'na':
            return None
        date_str = str(val).strip()
        for fmt in ('%d-%m-%Y', '%Y-%m-%d', '%d %B %Y', '%d %b %Y'):
            try:
                return pd.to_datetime(date_str, format=fmt).date()
            except:
                continue
        try:
            return pd.to_datetime(date_str).date()
        except:
            return None

    def extract_year(self, filename):
        match = re.search(r'\b(20\d{2})\b', filename)
        return int(match.group(1)) if match else 0

    def get_team_abbrev(self, team_name):
        if not team_name:
            return ""
        tn = str(team_name).lower().strip()
        if 'chennai' in tn or 'csk' in tn: return 'csk'
        if 'mumbai' in tn or 'mi' in tn: return 'mi'
        if 'bangalore' in tn or 'bengaluru' in tn or 'rcb' in tn: return 'rcb'
        if 'kolkata' in tn or 'kkr' in tn: return 'kkr'
        if 'rajasthan' in tn or 'rr' in tn: return 'rr'
        if 'sunrisers' in tn or 'srh' in tn or 'hyderabad' in tn: return 'srh'
        if 'delhi' in tn or 'dc' in tn or 'daredevils' in tn: return 'dc'
        if 'punjab' in tn or 'pbks' in tn or 'kxip' in tn: return 'pbks'
        if 'gujarat titans' in tn or 'gt' in tn: return 'gt'
        if 'lucknow' in tn or 'lsg' in tn: return 'lsg'
        if 'deccan' in tn or 'dec' in tn or 'chargers' in tn: return 'dec'
        if 'pune' in tn or 'rps' in tn or 'warriors' in tn:
            if 'warriors' in tn or 'pwi' in tn: return 'pwi'
            return 'rps'
        if 'gujarat lions' in tn or 'gl' in tn: return 'gl'
        if 'kochi' in tn or 'ktk' in tn: return 'ktk'
        return ""

    def ingest_matches(self, data_dir):
        match_csv = os.path.join(data_dir, 'ipl-matches.csv')
        if not os.path.exists(match_csv):
            self.stdout.write(self.style.WARNING("Matches CSV not found! skipping."))
            return

        self.stdout.write("Ingesting Matches...")
        df = pd.read_csv(match_csv)
        df = self.normalize_cols(df)

        # Load highlights mapping if available
        highlights_csv = os.path.join(data_dir, 'ipl_matches_2008_2026.csv')
        highlights_map = {}
        if os.path.exists(highlights_csv):
            self.stdout.write("Found ipl_matches_2008_2026.csv, loading highlights map...")
            try:
                hdf = pd.read_csv(highlights_csv)
                for _, hrow in hdf.iterrows():
                    h_season = self.parse_int(hrow.get('season'))
                    h_date = self.parse_date(hrow.get('date'))
                    h_t1 = str(hrow.get('team1', '')).strip()
                    h_t2 = str(hrow.get('team2', '')).strip()
                    h_url = str(hrow.get('youtube_url', '')).strip() if not pd.isna(hrow.get('youtube_url')) else None
                    h_ver = str(hrow.get('video_verified', '')).strip().lower() == 'true'
                    
                    if h_date and h_t1 and h_t2:
                        t1_abb = self.get_team_abbrev(h_t1)
                        t2_abb = self.get_team_abbrev(h_t2)
                        # Store in both directions
                        highlights_map[(h_season, t1_abb, t2_abb, h_date)] = (h_url, h_ver)
                        highlights_map[(h_season, t2_abb, t1_abb, h_date)] = (h_url, h_ver)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error loading highlights map: {e}"))

        matches_to_create = []
        matches_to_update = []
        existing_ids = set(Match.objects.values_list('match_id', flat=True))

        for _, row in df.iterrows():
            match_id = self.parse_int(row.get('id', row.get('match_id')))
            if not match_id:
                continue

            season_raw = str(row.get('season', '0'))
            season_match = re.search(r'\b(20\d{2})\b', season_raw)
            season = int(season_match.group(1)) if season_match else 0

            date_val = self.parse_date(row.get('date'))
            if not date_val:
                continue

            won_by = str(row.get('wonby', '')).strip().lower()
            margin = self.parse_int(row.get('margin', 0))

            win_by_runs = margin if won_by == 'runs' else 0
            win_by_wickets = margin if won_by == 'wickets' else 0

            team1 = str(row.get('team1', '')).strip()
            team2 = str(row.get('team2', '')).strip()

            # Retrieve highlight url
            t1_abb = self.get_team_abbrev(team1)
            t2_abb = self.get_team_abbrev(team2)
            h_url, h_ver = highlights_map.get((season, t1_abb, t2_abb, date_val), (None, False))

            if match_id in existing_ids:
                matches_to_update.append((match_id, h_url, h_ver))
                continue

            matches_to_create.append(Match(
                match_id=match_id,
                season=season,
                city=str(row.get('city', '')).strip() if not pd.isna(row.get('city')) else '',
                date=date_val,
                team1=team1,
                team2=team2,
                toss_winner=str(row.get('tosswinner', '')).strip(),
                toss_decision=str(row.get('tossdecision', '')).strip(),
                winner=str(row.get('winningteam', '')).strip() if not pd.isna(row.get('winningteam')) else '',
                win_by_runs=win_by_runs,
                win_by_wickets=win_by_wickets,
                venue=str(row.get('venue', '')).strip(),
                player_of_match=str(row.get('player_of_match', '')).strip() if not pd.isna(row.get('player_of_match')) else '',
                youtube_url=h_url,
                video_verified=h_ver
            ))

        if matches_to_create:
            Match.objects.bulk_create(matches_to_create, ignore_conflicts=True)
            self.stdout.write(self.style.SUCCESS(f"Matches Ingested: {len(matches_to_create)} new records."))

        if matches_to_update:
            with transaction.atomic():
                for m_id, h_url, h_ver in matches_to_update:
                    Match.objects.filter(match_id=m_id).update(youtube_url=h_url, video_verified=h_ver)
            self.stdout.write(self.style.SUCCESS(f"Matches Highlights Updated: {len(matches_to_update)} records."))

    def ingest_batting_records(self, data_dir):
        self.stdout.write("Ingesting Batting Records...")
        batting_folders = [
            ('Most Runs', False),
            ('All Seasons Combined', True)
        ]

        for folder_name, is_combined in batting_folders:
            folder_path = os.path.join(data_dir, folder_name)
            if not os.path.exists(folder_path):
                continue

            csv_pattern = os.path.join(folder_path, '*.csv')
            csv_files = glob.glob(csv_pattern)

            for file_path in csv_files:
                filename = os.path.basename(file_path)
                # For combined, season = 0. For seasonal, extract from name or fallback
                if is_combined:
                    filename_clean = filename.lower().replace(' ', '_').replace('-', '_')
                    if filename_clean != 'most_runs_all_seasons_combine.csv':
                        continue
                    season = 0
                else:
                    season = self.extract_year(filename)
                    if season == 0:
                        continue

                df = pd.read_csv(file_path)
                df = self.normalize_cols(df)

                records_to_create = []
                for _, row in df.iterrows():
                    player_name = str(row.get('player', '')).strip()
                    if not player_name:
                        continue

                    # Safe parsing helper fields
                    mat = self.parse_int(row.get('mat', row.get('matches', 0)))
                    inns = self.parse_int(row.get('inns', row.get('innings', 0)))
                    runs = self.parse_int(row.get('runs', 0))
                    bf = self.parse_int(row.get('bf', row.get('balls_faced', 0)))
                    hs = str(row.get('hs', row.get('highest_score', ''))).strip()
                    avg = self.parse_float(row.get('avg', row.get('average', 0.0)))
                    sr = self.parse_float(row.get('sr', row.get('strike_rate', 0.0)))
                    hundreds = self.parse_int(row.get('100', row.get('hundreds', 0)))
                    fifties = self.parse_int(row.get('50', row.get('fifties', 0)))
                    fours = self.parse_int(row.get('4s', row.get('fours', 0)))
                    sixes = self.parse_int(row.get('6s', row.get('sixes', 0)))
                    no = self.parse_int(row.get('no', row.get('not_outs', 0)))

                    records_to_create.append(BattingRecord(
                        player=player_name,
                        season=season,
                        matches=mat,
                        innings=inns,
                        runs=runs,
                        balls_faced=bf,
                        highest_score=hs,
                        average=avg,
                        strike_rate=sr,
                        hundreds=hundreds,
                        fifties=fifties,
                        fours=fours,
                        sixes=sixes,
                        not_outs=no
                    ))

                if records_to_create:
                    with transaction.atomic():
                        # We use upsert style using update_or_create or bulk update
                        for rec in records_to_create:
                            BattingRecord.objects.update_or_create(
                                player=rec.player,
                                season=rec.season,
                                defaults={
                                    'matches': rec.matches,
                                    'innings': rec.innings,
                                    'runs': rec.runs,
                                    'balls_faced': rec.balls_faced,
                                    'highest_score': rec.highest_score,
                                    'average': rec.average,
                                    'strike_rate': rec.strike_rate,
                                    'hundreds': rec.hundreds,
                                    'fifties': rec.fifties,
                                    'fours': rec.fours,
                                    'sixes': rec.sixes,
                                    'not_outs': rec.not_outs,
                                }
                            )
                self.stdout.write(f"  Processed Batting file: {filename} ({len(records_to_create)} rows)")

        self.stdout.write(self.style.SUCCESS("Batting Records Ingested."))

    def ingest_bowling_records(self, data_dir):
        self.stdout.write("Ingesting Bowling Records...")
        bowling_folders = [
            ('Most Wickets', False),
            ('All Seasons Combined', True)
        ]

        for folder_name, is_combined in bowling_folders:
            folder_path = os.path.join(data_dir, folder_name)
            if not os.path.exists(folder_path):
                continue

            csv_pattern = os.path.join(folder_path, '*.csv')
            csv_files = glob.glob(csv_pattern)

            for file_path in csv_files:
                filename = os.path.basename(file_path)
                if is_combined:
                    filename_clean = filename.lower().replace(' ', '_').replace('-', '_')
                    if filename_clean != 'most_wickets_all_seasons_combine.csv':
                        continue
                    season = 0
                else:
                    season = self.extract_year(filename)
                    if season == 0:
                        continue

                df = pd.read_csv(file_path)
                df = self.normalize_cols(df)

                records_to_create = []
                for _, row in df.iterrows():
                    player_name = str(row.get('player', '')).strip()
                    if not player_name:
                        continue

                    mat = self.parse_int(row.get('mat', row.get('matches', 0)))
                    inns = self.parse_int(row.get('inns', row.get('innings', 0)))
                    ov = self.parse_float(row.get('ov', row.get('overs', 0.0)))
                    runs = self.parse_int(row.get('runs', 0))
                    wkts = self.parse_int(row.get('wkts', row.get('wickets', 0)))
                    econ = self.parse_float(row.get('econ', row.get('economy', 0.0)))
                    sr = self.parse_float(row.get('sr', row.get('strike_rate', 0.0)))
                    bbi = str(row.get('bbi', row.get('best_bowling', ''))).strip()
                    four_w = self.parse_int(row.get('4w', row.get('four_wickets', 0)))
                    five_w = self.parse_int(row.get('5w', row.get('five_wickets', 0)))

                    records_to_create.append(BowlingRecord(
                        player=player_name,
                        season=season,
                        matches=mat,
                        innings=inns,
                        overs=ov,
                        runs_conceded=runs,
                        wickets=wkts,
                        economy=econ,
                        strike_rate=sr,
                        best_bowling=bbi,
                        four_wickets=four_w,
                        five_wickets=five_w
                    ))

                if records_to_create:
                    with transaction.atomic():
                        for rec in records_to_create:
                            BowlingRecord.objects.update_or_create(
                                player=rec.player,
                                season=rec.season,
                                defaults={
                                    'matches': rec.matches,
                                    'innings': rec.innings,
                                    'overs': rec.overs,
                                    'runs_conceded': rec.runs_conceded,
                                    'wickets': rec.wickets,
                                    'economy': rec.economy,
                                    'strike_rate': rec.strike_rate,
                                    'best_bowling': rec.best_bowling,
                                    'four_wickets': rec.four_wickets,
                                    'five_wickets': rec.five_wickets,
                                }
                            )
                self.stdout.write(f"  Processed Bowling file: {filename} ({len(records_to_create)} rows)")

        self.stdout.write(self.style.SUCCESS("Bowling Records Ingested."))

    def supplement_bowling_economy(self, data_dir):
        self.stdout.write("Supplementing Bowling Records from Economy Innings data...")
        folder_path = os.path.join(data_dir, 'Best Bowling Economy Innings')
        if not os.path.exists(folder_path):
            self.stdout.write("  Best Bowling Economy Innings directory not found.")
            return

        csv_pattern = os.path.join(folder_path, '*.csv')
        csv_files = glob.glob(csv_pattern)

        for file_path in csv_files:
            filename = os.path.basename(file_path)
            season = self.extract_year(filename)
            if season == 0:
                continue

            df = pd.read_csv(file_path)
            df = self.normalize_cols(df)

            # Sort by economy ascending so we process best economy first
            df = df.sort_values(by='econ', ascending=True)

            processed_players = set()
            for _, row in df.iterrows():
                player_name = str(row.get('player', '')).strip()
                if not player_name or player_name in processed_players:
                    continue

                processed_players.add(player_name)

                # Get or create BowlingRecord
                ov = self.parse_float(row.get('ov', 0.0))
                runs = self.parse_int(row.get('runs', 0))
                wkts = self.parse_int(row.get('wkts', 0))
                econ = self.parse_float(row.get('econ', 0.0))
                sr = self.parse_float(row.get('sr', 0.0))

                BowlingRecord.objects.get_or_create(
                    player=player_name,
                    season=season,
                    defaults={
                        'matches': 1,
                        'innings': 1,
                        'overs': ov,
                        'runs_conceded': runs,
                        'wickets': wkts,
                        'economy': econ,
                        'strike_rate': sr,
                        'best_bowling': f"{runs}/{wkts}" if wkts > 0 else ""
                    }
                )

            self.stdout.write(f"  Processed Economy Innings file: {filename}")

    def ingest_milestones(self, data_dir):
        self.stdout.write("Ingesting Milestones...")
        milestone_folders = [
            ('Fastest Centuries', 'century', False),
            ('Fastest Fifties', 'fifty', False),
            ('All Seasons Combined', 'century', True), # Century combined
            ('All Seasons Combined', 'fifty', True)    # Fifty combined
        ]

        # Clear existing milestones to avoid duplicates
        MilestoneRecord.objects.all().delete()

        milestones_to_create = []

        for folder_name, record_type, is_combined in milestone_folders:
            folder_path = os.path.join(data_dir, folder_name)
            if not os.path.exists(folder_path):
                continue

            csv_pattern = os.path.join(folder_path, '*.csv')
            csv_files = glob.glob(csv_pattern)

            for file_path in csv_files:
                filename = os.path.basename(file_path)

                if is_combined:
                    # Match name patterns
                    filename_clean = filename.lower().replace(' ', '_').replace('-', '_')
                    if record_type == 'century' and filename_clean != 'fastest_centuries_all_seasons_combine.csv':
                        continue
                    if record_type == 'fifty' and filename_clean != 'fastest_fifties_all_seasons_combine.csv':
                        continue
                    season = 0
                else:
                    season = self.extract_year(filename)
                    if season == 0:
                        continue

                df = pd.read_csv(file_path)
                df = self.normalize_cols(df)

                for _, row in df.iterrows():
                    player_name = str(row.get('player', '')).strip()
                    if not player_name:
                        continue

                    balls = self.parse_int(row.get('bf', row.get('balls', 0)))
                    runs = self.parse_int(row.get('runs', 0))
                    against = str(row.get('against', '')).strip()
                    venue = str(row.get('venue', '')).strip()

                    milestones_to_create.append(MilestoneRecord(
                        player=player_name,
                        season=season,
                        balls=balls,
                        runs=runs,
                        against=against,
                        venue=venue,
                        record_type=record_type
                    ))

            self.stdout.write(f"  Processed {folder_name} for {record_type}")

        if milestones_to_create:
            MilestoneRecord.objects.bulk_create(milestones_to_create)

        self.stdout.write(self.style.SUCCESS(f"Milestone Records Ingested: {len(milestones_to_create)} records."))
