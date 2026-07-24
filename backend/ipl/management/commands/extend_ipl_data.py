import os
import re
import pandas as pd
import numpy as np
from django.core.management.base import BaseCommand
from django.db import transaction
from ipl.models import Match, BattingRecord, BowlingRecord, MilestoneRecord

class Command(BaseCommand):
    help = 'Ingest Cricsheet-extracted match-by-match CSV data into SQLite DB'

    def add_arguments(self, parser):
        parser.add_argument('--matches', type=str, default='ipl_player_data_output/matches_all.csv',
                            help='Path to matches_all.csv')
        parser.add_argument('--batting', type=str, default='ipl_player_data_output/player_match_batting.csv',
                            help='Path to player_match_batting.csv')
        parser.add_argument('--bowling', type=str, default='ipl_player_data_output/player_match_bowling.csv',
                            help='Path to player_match_bowling.csv')

    def parse_date(self, val):
        if pd.isna(val) or not val:
            return None
        date_str = str(val).strip()
        # Dates in Cricsheet matches_all.csv are typically YYYY-MM-DD or YYYY/MM/DD
        for fmt in ('%Y-%m-%d', '%Y/%m/%d', '%d-%m-%Y', '%d/%m/%Y'):
            try:
                return pd.to_datetime(date_str, format=fmt).date()
            except:
                continue
        try:
            return pd.to_datetime(date_str).date()
        except:
            return None

    def handle(self, *args, **options):
        matches_path = options['matches']
        batting_path = options['batting']
        bowling_path = options['bowling']

        # Normalise paths relative to backend directory if not absolute
        if not os.path.isabs(matches_path):
            matches_path = os.path.join(os.getcwd(), matches_path)
        if not os.path.isabs(batting_path):
            batting_path = os.path.join(os.getcwd(), batting_path)
        if not os.path.isabs(bowling_path):
            bowling_path = os.path.join(os.getcwd(), bowling_path)

        self.stdout.write(f"Matches CSV: {matches_path}")
        self.stdout.write(f"Batting CSV: {batting_path}")
        self.stdout.write(f"Bowling CSV: {bowling_path}")

        if not os.path.exists(matches_path) or not os.path.exists(batting_path) or not os.path.exists(bowling_path):
            self.stdout.write(self.style.ERROR("One or more input CSV files do not exist! Ensure you run the extractor script first."))
            return

        # ----------------------------------------------------
        # 1. Ingest Matches
        # ----------------------------------------------------
        self.stdout.write("Reading matches...")
        matches_df = pd.read_csv(matches_path)
        existing_match_ids = set(Match.objects.values_list('match_id', flat=True))

        new_matches_to_create = []
        for _, row in matches_df.iterrows():
            # Clean match_id. In Cricsheet it can be like '1359475'
            try:
                m_id = int(float(row['match_id']))
            except:
                continue

            if m_id in existing_match_ids:
                continue

            # Parse season year
            try:
                season = int(row['year'])
            except:
                season = 0

            date_val = self.parse_date(row.get('date'))
            if not date_val:
                continue

            # Determine WonBy and Margin
            win_by_runs = int(row.get('win_by_runs', 0)) if not pd.isna(row.get('win_by_runs')) else 0
            win_by_wickets = int(row.get('win_by_wickets', 0)) if not pd.isna(row.get('win_by_wickets')) else 0

            new_matches_to_create.append(Match(
                match_id=m_id,
                season=season,
                city=str(row.get('city', '')).strip() if not pd.isna(row.get('city')) else '',
                date=date_val,
                team1=str(row.get('team1', '')).strip(),
                team2=str(row.get('team2', '')).strip(),
                toss_winner=str(row.get('toss_winner', '')).strip(),
                toss_decision=str(row.get('toss_decision', '')).strip(),
                winner=str(row.get('winner', '')).strip() if not pd.isna(row.get('winner')) else '',
                win_by_runs=win_by_runs,
                win_by_wickets=win_by_wickets,
                venue=str(row.get('venue', '')).strip(),
                player_of_match=str(row.get('player_of_match', '')).strip() if not pd.isna(row.get('player_of_match')) else ''
            ))

        if new_matches_to_create:
            with transaction.atomic():
                Match.objects.bulk_create(new_matches_to_create, ignore_conflicts=True)
            self.stdout.write(self.style.SUCCESS(f"Successfully inserted {len(new_matches_to_create)} new Match records."))
        else:
            self.stdout.write("No new matches to ingest.")

        # ----------------------------------------------------
        # 2. Ingest Batting Records (Aggregated per season)
        # ----------------------------------------------------
        self.stdout.write("Reading batting details...")
        bat_df = pd.read_csv(batting_path)

        # Aggregate season stats
        self.stdout.write("Aggregating seasonal batting stats...")
        # Add a helper for highest score formatting (e.g. '87*')
        # We group by player and season
        bat_groups = bat_df.groupby(['player', 'year'])

        batting_records = []
        milestones = []

        for (player, season), group in bat_groups:
            season = int(season)
            matches = group['match_id'].nunique()
            # Innings where they faced at least one ball or scored runs
            innings = len(group[group['balls_faced'] > 0])
            runs = int(group['runs'].sum())
            balls_faced = int(group['balls_faced'].sum())
            sixes = int(group['sixes'].sum())
            fours = int(group['fours'].sum())
            not_outs = int(group['not_out'].sum())
            hundreds = int(group['is_hundred'].sum())
            fifties = int(group['is_fifty'].sum())

            # Highest score calculation with not_out detection
            max_idx = group['runs'].idxmax()
            best_row = group.loc[max_idx]
            best_runs = int(best_row['runs'])
            best_notout = '*' if best_row['not_out'] == 1 else ''
            highest_score = f"{best_runs}{best_notout}"

            avg = round(runs / (innings - not_outs), 2) if (innings - not_outs) > 0 else float(runs)
            sr = round((runs / balls_faced) * 100, 2) if balls_faced > 0 else 0.0

            batting_records.append(BattingRecord(
                player=player,
                season=season,
                matches=matches,
                innings=innings,
                runs=runs,
                balls_faced=balls_faced,
                highest_score=highest_score,
                average=avg,
                strike_rate=sr,
                hundreds=hundreds,
                fifties=fifties,
                fours=fours,
                sixes=sixes,
                not_outs=not_outs
            ))

            # Milestones processing for individual innings
            for _, row in group.iterrows():
                runs_inns = int(row['runs'])
                if runs_inns >= 50:
                    rec_type = 'century' if runs_inns >= 100 else 'fifty'
                    # Retrieve venue and date
                    venue = str(row.get('venue', '')).split(', ')[0]
                    # We need to figure out who they played against
                    m_id_val = str(row['match_id'])
                    against = ''
                    # Query matches_df for against team
                    m_meta = matches_df[matches_df['match_id'].astype(str) == m_id_val]
                    if not m_meta.empty:
                        t1 = m_meta.iloc[0]['team1']
                        t2 = m_meta.iloc[0]['team2']
                        batting_team = row['batting_team']
                        against = t2 if batting_team == t1 else t1

                    milestones.append(MilestoneRecord(
                        player=player,
                        season=season,
                        balls=int(row['balls_faced']),
                        runs=runs_inns,
                        against=str(against),
                        venue=venue,
                        record_type=rec_type
                    ))

        # Also aggregate for career overall (season = 0)
        self.stdout.write("Aggregating overall career batting stats...")
        career_groups = bat_df.groupby('player')
        for player, group in career_groups:
            matches = group['match_id'].nunique()
            innings = len(group[group['balls_faced'] > 0])
            runs = int(group['runs'].sum())
            balls_faced = int(group['balls_faced'].sum())
            sixes = int(group['sixes'].sum())
            fours = int(group['fours'].sum())
            not_outs = int(group['not_out'].sum())
            hundreds = int(group['is_hundred'].sum())
            fifties = int(group['is_fifty'].sum())

            max_idx = group['runs'].idxmax()
            best_row = group.loc[max_idx]
            best_runs = int(best_row['runs'])
            best_notout = '*' if best_row['not_out'] == 1 else ''
            highest_score = f"{best_runs}{best_notout}"

            avg = round(runs / (innings - not_outs), 2) if (innings - not_outs) > 0 else float(runs)
            sr = round((runs / balls_faced) * 100, 2) if balls_faced > 0 else 0.0

            batting_records.append(BattingRecord(
                player=player,
                season=0,
                matches=matches,
                innings=innings,
                runs=runs,
                balls_faced=balls_faced,
                highest_score=highest_score,
                average=avg,
                strike_rate=sr,
                hundreds=hundreds,
                fifties=fifties,
                fours=fours,
                sixes=sixes,
                not_outs=not_outs
            ))

        self.stdout.write("Ingesting Batting Records into Database (upsert format)...")
        with transaction.atomic():
            for rec in batting_records:
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
        self.stdout.write(self.style.SUCCESS(f"Finished ingesting {len(batting_records)} BattingRecord rows."))

        # ----------------------------------------------------
        # 3. Ingest Bowling Records (Aggregated per season)
        # ----------------------------------------------------
        self.stdout.write("Reading bowling details...")
        bowl_df = pd.read_csv(bowling_path)

        self.stdout.write("Aggregating seasonal bowling stats...")
        bowl_groups = bowl_df.groupby(['player', 'year'])

        def get_better_bbi(bbi1, bbi2):
            if not bbi1: return bbi2
            if not bbi2: return bbi1
            w1, r1 = map(int, str(bbi1).split('/'))
            w2, r2 = map(int, str(bbi2).split('/'))
            if w1 > w2: return bbi1
            if w1 < w2: return bbi2
            return bbi1 if r1 <= r2 else bbi2

        bowling_records = []

        for (player, season), group in bowl_groups:
            season = int(season)
            matches = group['match_id'].nunique()
            innings = len(group[group['balls_bowled'] > 0])
            total_runs = int(group['runs_given'].sum())
            total_balls = int(group['balls_bowled'].sum())
            total_wkts = int(group['wickets'].sum())

            four_w = sum(1 for w in group['wickets'] if w == 4)
            five_w = sum(1 for w in group['wickets'] if w >= 5)

            # BBI
            best_idx = group['wickets'].idxmax()
            best_row = group.loc[best_idx]
            bbi_val = f"{int(best_row['wickets'])}/{int(best_row['runs_given'])}"

            # Handle fractional overs notation (e.g. 42.4 overs)
            overs = int(total_balls / 6) + (total_balls % 6) / 10.0
            avg = round(total_runs / total_wkts, 2) if total_wkts > 0 else 0.0
            econ = round(total_runs / (total_balls / 6), 2) if total_balls > 0 else 0.0
            sr = round(total_balls / total_wkts, 2) if total_wkts > 0 else 0.0

            bowling_records.append(BowlingRecord(
                player=player,
                season=season,
                matches=matches,
                innings=innings,
                overs=overs,
                runs_conceded=total_runs,
                wickets=total_wkts,
                economy=econ,
                strike_rate=sr,
                best_bowling=bbi_val,
                four_wickets=four_w,
                five_wickets=five_w
            ))

        # Aggregate overall career bowling stats (season = 0)
        self.stdout.write("Aggregating overall career bowling stats...")
        career_bowl_groups = bowl_df.groupby('player')
        for player, group in career_bowl_groups:
            matches = group['match_id'].nunique()
            innings = len(group[group['balls_bowled'] > 0])
            total_runs = int(group['runs_given'].sum())
            total_balls = int(group['balls_bowled'].sum())
            total_wkts = int(group['wickets'].sum())

            four_w = sum(1 for w in group['wickets'] if w == 4)
            five_w = sum(1 for w in group['wickets'] if w >= 5)

            # Career best BBI calculation
            bbi_val = ''
            for _, r in group.iterrows():
                cur_bbi = f"{int(r['wickets'])}/{int(r['runs_given'])}"
                bbi_val = get_better_bbi(bbi_val, cur_bbi)

            overs = int(total_balls / 6) + (total_balls % 6) / 10.0
            avg = round(total_runs / total_wkts, 2) if total_wkts > 0 else 0.0
            econ = round(total_runs / (total_balls / 6), 2) if total_balls > 0 else 0.0
            sr = round(total_balls / total_wkts, 2) if total_wkts > 0 else 0.0

            bowling_records.append(BowlingRecord(
                player=player,
                season=0,
                matches=matches,
                innings=innings,
                overs=overs,
                runs_conceded=total_runs,
                wickets=total_wkts,
                economy=econ,
                strike_rate=sr,
                best_bowling=bbi_val,
                four_wickets=four_w,
                five_wickets=five_w
            ))

        self.stdout.write("Ingesting Bowling Records into Database...")
        with transaction.atomic():
            for rec in bowling_records:
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
        self.stdout.write(self.style.SUCCESS(f"Finished ingesting {len(bowling_records)} BowlingRecord rows."))

        # ----------------------------------------------------
        # 4. Ingest Milestones (Fastest Centuries / Fifties)
        # ----------------------------------------------------
        self.stdout.write("Ingesting Milestone records...")
        if milestones:
            # Drop old records before re-creating to avoid duplicates
            # Milestones can be wiped and fully reloaded safely since they are computed from the CSV
            with transaction.atomic():
                MilestoneRecord.objects.all().delete()
                # Create milestones in batches of 1000
                batch_size = 1000
                for i in range(0, len(milestones), batch_size):
                    MilestoneRecord.objects.bulk_create(milestones[i:i + batch_size])
            self.stdout.write(self.style.SUCCESS(f"Successfully loaded {len(milestones)} Milestones."))

        self.stdout.write(self.style.SUCCESS("CRICSHEET EXTEND INGESTION COMPLETED SUCCESSFULLY!"))
