import os
import sys
import django

# Setup django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ipl_project.settings')
django.setup()

from django.db import transaction
from ipl.models import Match, BattingRecord, BowlingRecord, MilestoneRecord

MAPPING = {
    'V Kohli': 'Virat Kohli',
    'T Kohli': 'Taruwar Kohli',
    'RG Sharma': 'Rohit Sharma',
    'R Sharma': 'Rahul Sharma',
    'I Sharma': 'Ishant Sharma',
    'JM Sharma': 'Jitesh Sharma',
    'KV Sharma': 'Karn Sharma',
    'MM Sharma': 'Mohit Sharma',
    'SK Raina': 'Suresh Raina',
    'DA Warner': 'David Warner',
    'CH Gayle': 'Chris Gayle',
    'S Dhawan': 'Shikhar Dhawan',
    'R Dhawan': 'Rishi Dhawan',
    'RV Uthappa': 'Robin Uthappa',
    'KD Karthik': 'Dinesh Karthik',
    'RA Jadeja': 'Ravindra Jadeja',
    'KA Pollard': 'Kieron Pollard',
    'K L Rahul': 'KL Rahul',
    'SR Watson': 'Shane Watson',
    'IK Pathan': 'Irfan Pathan',
    'YK Pathan': 'Yusuf Pathan',
    'AUK Pathan': 'Asad Pathan',
    'G Gambhir': 'Gautam Gambhir',
    'AT Rayudu': 'Ambati Rayudu',
    'SV Samson': 'Sanju Samson',
    'RR Pant': 'Rishabh Pant',
    'SS Iyer': 'Shreyas Iyer',
    'VR Iyer': 'Venkatesh Iyer',
    'GJ Maxwell': 'Glenn Maxwell',
}

def recalculate_batting_career(player_name):
    """Recalculate career stats (season=0) for a batting player based on their season records"""
    seasons = BattingRecord.objects.filter(player=player_name).exclude(season=0)
    if not seasons.exists():
        BattingRecord.objects.filter(player=player_name, season=0).delete()
        return

    matches = sum(s.matches for s in seasons)
    innings = sum(s.innings for s in seasons)
    runs = sum(s.runs for s in seasons)
    balls_faced = sum(s.balls_faced for s in seasons)
    fours = sum(s.fours for s in seasons)
    sixes = sum(s.sixes for s in seasons)
    not_outs = sum(s.not_outs for s in seasons)
    hundreds = sum(s.hundreds for s in seasons)
    fifties = sum(s.fifties for s in seasons)
    highest_score = max((s.highest_score for s in seasons), default=0)

    # Compute average
    outs = innings - not_outs
    average = round(runs / outs, 2) if outs > 0 else float(runs)
    strike_rate = round((runs / balls_faced) * 100, 2) if balls_faced > 0 else 0.0

    BattingRecord.objects.update_or_create(
        player=player_name,
        season=0,
        defaults={
            'matches': matches,
            'innings': innings,
            'runs': runs,
            'balls_faced': balls_faced,
            'highest_score': highest_score,
            'average': average,
            'strike_rate': strike_rate,
            'hundreds': hundreds,
            'fifties': fifties,
            'fours': fours,
            'sixes': sixes,
            'not_outs': not_outs,
        }
    )

def recalculate_bowling_career(player_name):
    """Recalculate career stats (season=0) for a bowling player based on their season records"""
    seasons = BowlingRecord.objects.filter(player=player_name).exclude(season=0)
    if not seasons.exists():
        BowlingRecord.objects.filter(player=player_name, season=0).delete()
        return

    matches = sum(s.matches for s in seasons)
    innings = sum(s.innings for s in seasons)
    runs_conceded = sum(s.runs_conceded for s in seasons)
    wickets = sum(s.wickets for s in seasons)
    four_wickets = sum(s.four_wickets for s in seasons)
    five_wickets = sum(s.five_wickets for s in seasons)

    # Calculate total balls to sum overs correctly
    total_balls = 0
    for s in seasons:
        overs_int = int(s.overs)
        overs_balls = int(round((s.overs - overs_int) * 10))
        total_balls += (overs_int * 6) + overs_balls

    overs = float(f"{total_balls // 6}.{total_balls % 6}")

    # Economy: runs conceded / overs
    overs_decimal = total_balls / 6
    economy = round(runs_conceded / overs_decimal, 2) if total_balls > 0 else 0.0
    strike_rate = round(total_balls / wickets, 2) if wickets > 0 else 0.0

    # Parse best bowling figure
    best_bowling = ""
    max_w = -1
    min_r = 999
    for s in seasons:
        if s.best_bowling and '/' in s.best_bowling:
            try:
                w, r = map(int, s.best_bowling.split('/'))
                if w > max_w or (w == max_w and r < min_r):
                    max_w = w
                    min_r = r
                    best_bowling = s.best_bowling
            except:
                pass

    BowlingRecord.objects.update_or_create(
        player=player_name,
        season=0,
        defaults={
            'matches': matches,
            'innings': innings,
            'overs': overs,
            'runs_conceded': runs_conceded,
            'wickets': wickets,
            'economy': economy,
            'strike_rate': strike_rate,
            'best_bowling': best_bowling,
            'four_wickets': four_wickets,
            'five_wickets': five_wickets,
        }
    )

def run_normalization():
    print("Starting player name normalization...")
    
    for src, dest in MAPPING.items():
        print(f"Consolidating '{src}' -> '{dest}'...")
        
        with transaction.atomic():
            # 1. Update Match player_of_match
            Match.objects.filter(player_of_match=src).update(player_of_match=dest)
            
            # 2. Update MilestoneRecord
            milestones = MilestoneRecord.objects.filter(player=src)
            for m in milestones:
                # check if destination already has this milestone to avoid integrity errors
                exists = MilestoneRecord.objects.filter(
                    player=dest,
                    season=m.season,
                    balls=m.balls,
                    runs=m.runs,
                    record_type=m.record_type
                ).exists()
                if exists:
                    m.delete()
                else:
                    m.player = dest
                    m.save()
            
            # 3. Batting Records consolidation (for active seasons, i.e., season > 0)
            src_batting = BattingRecord.objects.filter(player=src).exclude(season=0)
            for src_rec in src_batting:
                try:
                    dest_rec = BattingRecord.objects.get(player=dest, season=src_rec.season)
                    # If both exist, keep the one with higher runs, delete the other
                    if src_rec.runs > dest_rec.runs:
                        dest_rec.delete()
                        src_rec.player = dest
                        src_rec.save()
                    else:
                        src_rec.delete()
                except BattingRecord.DoesNotExist:
                    src_rec.player = dest
                    src_rec.save()

            # 4. Bowling Records consolidation (for active seasons, i.e., season > 0)
            src_bowling = BowlingRecord.objects.filter(player=src).exclude(season=0)
            for src_rec in src_bowling:
                try:
                    dest_rec = BowlingRecord.objects.get(player=dest, season=src_rec.season)
                    # If both exist, keep the one with higher wickets
                    if src_rec.wickets > dest_rec.wickets:
                        dest_rec.delete()
                        src_rec.player = dest
                        src_rec.save()
                    else:
                        src_rec.delete()
                except BowlingRecord.DoesNotExist:
                    src_rec.player = dest
                    src_rec.save()
                    
            # 5. Clean up old career summary (season=0) records for source
            BattingRecord.objects.filter(player=src, season=0).delete()
            BowlingRecord.objects.filter(player=src, season=0).delete()
            
            # 6. Recalculate career summary (season=0) for destination player
            recalculate_batting_career(dest)
            recalculate_bowling_career(dest)

    print("Normalization completed successfully!")

if __name__ == "__main__":
    run_normalization()
