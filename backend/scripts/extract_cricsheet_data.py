# ============================================================
# MASTER PROMPT - IPL PLAYER MATCH-BY-MATCH DATA EXTRACTOR
# Paste this entire block into Anaconda IDE and run it
# Requirements: pip install pandas requests beautifulsoup4 tqdm
# ============================================================

import pandas as pd
import numpy as np
import os
import json
import zipfile
import requests
import sys
from io import BytesIO
from tqdm import tqdm
import warnings
import re
warnings.filterwarnings('ignore')

# ============================================================
# STEP 1 - DOWNLOAD DATA FROM CRICSHEET
# ============================================================

print("[1/12] Downloading IPL data from Cricsheet...")

url = "https://cricsheet.org/downloads/ipl_csv2.zip"
try:
    response = requests.get(url, timeout=120)
    response.raise_for_status()
    z = zipfile.ZipFile(BytesIO(response.content))
except Exception as e:
    print(f"Error downloading or extracting Cricsheet data: {e}")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, "..", ".."))
    local_zip = os.path.join(root_dir, "data", "raw", "datasets_archive", "ipl_dataset_zip.zip")
    if not os.path.exists(local_zip):
        local_zip = os.path.join(root_dir, "data", "raw", "data_zip.zip")
    if os.path.exists(local_zip):
        print(f"Loading backup local zip '{local_zip}'...")
        z = zipfile.ZipFile(local_zip)
    else:
        print("No local backup zip found. Exiting.")
        sys.exit(1)

print(f"Successfully loaded. Total files in zip: {len(z.namelist())}")

# ============================================================
# STEP 2 - PARSE ALL MATCH INFO FILES
# ============================================================

info_files = [f for f in z.namelist() if f.endswith('_info.csv')]
delivery_files = [f for f in z.namelist() if not f.endswith('_info.csv') and f.endswith('.csv')]

print(f"Match info files count: {len(info_files)} | Deliveries files count: {len(delivery_files)}")

all_matches = []

for fname in tqdm(info_files, desc="Parsing match info"):
    try:
        lines = z.open(fname).read().decode('utf-8').splitlines()
        match_id = fname.replace('_info.csv', '').split('/')[-1]
        row = {'match_id': match_id}
        
        teams = []
        players = []
        
        for line in lines:
            parts = line.strip().split(',')
            if len(parts) < 2:
                continue
            
            clean_parts = [p.strip().strip('"\'') for p in parts]
            if clean_parts[0] == 'info':
                key = clean_parts[1]
                val = ','.join(clean_parts[2:])
                
                if key == 'team':
                    teams.append(val)
                elif key == 'player':
                    players.append(val)
                else:
                    row[key] = val
                    
        row['team1'] = teams[0] if len(teams) > 0 else None
        row['team2'] = teams[1] if len(teams) > 1 else None
        row['win_by_runs'] = int(row.get('winner_runs', 0))
        row['win_by_wickets'] = int(row.get('winner_wickets', 0))
        row['players'] = '|'.join(players)
        
        all_matches.append(row)
    except Exception as e:
        pass

matches_df = pd.DataFrame(all_matches)
matches_df['match_id'] = matches_df['match_id'].astype(str)

# Extract year from season or date
def extract_year(row):
    try:
        if 'date' in row and row['date']:
            date_str = str(row['date']).strip()
            match = re.search(r'\b(20\d{2})\b', date_str)
            if match:
                return int(match.group(1))
    except:
        pass
    try:
        if 'season' in row and row['season'] and str(row['season']).strip():
            s = str(row['season'])
            match = re.search(r'\b(20\d{2})\b', s)
            if match:
                return int(match.group(1))
            return int(s[:4])
    except:
        pass
    return None

matches_df['year'] = matches_df.apply(extract_year, axis=1)
print(f"Parsed {len(matches_df)} matches across years: {sorted(matches_df['year'].dropna().unique().astype(int).tolist())}")

# ============================================================
# STEP 3 - PARSE ALL DELIVERY FILES
# ============================================================

all_deliveries = []

for fname in tqdm(delivery_files, desc="Parsing deliveries"):
    try:
        match_id = fname.replace('.csv', '').split('/')[-1]
        df = pd.read_csv(z.open(fname))
        df['match_id'] = match_id
        all_deliveries.append(df)
    except:
        pass

deliveries_df = pd.concat(all_deliveries, ignore_index=True)
deliveries_df['match_id'] = deliveries_df['match_id'].astype(str)
print(f"Parsed {len(deliveries_df):,} deliveries")

# ============================================================
# STEP 4 - MERGE TO GET SEASON/DATE ON DELIVERIES
# ============================================================

meta = matches_df[['match_id', 'year', 'date', 'winner']].copy()
deliveries_df = deliveries_df.merge(meta, on='match_id', how='left')

# ============================================================
# STEP 5 - TEAM NAME NORMALISATION
# ============================================================

TEAM_MAP = {
    'Royal Challengers Bangalore': 'Royal Challengers Bengaluru',
    'Delhi Daredevils': 'Delhi Capitals',
    'Kings XI Punjab': 'Punjab Kings',
    'Deccan Chargers': 'Sunrisers Hyderabad',
    'Pune Warriors': 'Rising Pune Supergiant',
    'Kochi Tuskers Kerala': 'Kochi Tuskers Kerala',
    'Gujarat Lions': 'Gujarat Lions',
}

def norm_team(t):
    return TEAM_MAP.get(t, t) if t else t

for col in ['team1', 'team2', 'winner', 'batting_team', 'bowling_team']:
    if col in deliveries_df.columns:
        deliveries_df[col] = deliveries_df[col].map(norm_team)
    if col in matches_df.columns:
        matches_df[col] = matches_df[col].map(norm_team)

# ============================================================
# STEP 6 - PLAYER MATCH-BY-MATCH BATTING STATS
# ============================================================

print("\nComputing player match-by-match batting stats...")

bat_cols_needed = ['match_id', 'striker', 'batting_team', 'runs_off_bat',
                   'extras', 'wides', 'noballs', 'wicket_type', 'player_dismissed',
                   'year', 'date', 'venue', 'winner']
bat_cols = [c for c in bat_cols_needed if c in deliveries_df.columns]

bat_df = deliveries_df[bat_cols].copy()
bat_df = bat_df.rename(columns={'striker': 'player'})

# Only legal balls for SR (exclude wides)
bat_df['is_wide'] = bat_df['wides'].fillna(0) > 0
bat_df['balls_faced'] = (~bat_df['is_wide']).astype(int)
bat_df['runs_off_bat'] = bat_df['runs_off_bat'].fillna(0).astype(int)

# Boundary detection - need boundary col or infer
if 'runs_off_bat' in bat_df.columns:
    bat_df['is_four'] = (bat_df['runs_off_bat'] == 4).astype(int)
    bat_df['is_six'] = (bat_df['runs_off_bat'] == 6).astype(int)
else:
    bat_df['is_four'] = 0
    bat_df['is_six'] = 0

# Dismissal - was this player dismissed?
bat_df['was_dismissed'] = (
    bat_df.get('player_dismissed', pd.Series(dtype=str)).fillna('') == bat_df['player']
).astype(int)

player_match_batting = bat_df.groupby(['match_id', 'player', 'batting_team', 'year', 'date', 'venue']).agg(
    runs=('runs_off_bat', 'sum'),
    balls_faced=('balls_faced', 'sum'),
    fours=('is_four', 'sum'),
    sixes=('is_six', 'sum'),
    dismissed=('was_dismissed', 'max'),
).reset_index()

player_match_batting['strike_rate'] = (
    player_match_batting['runs'] / player_match_batting['balls_faced'] * 100
).round(2).replace([np.inf, -np.inf], 0).fillna(0)

player_match_batting['not_out'] = 1 - player_match_batting['dismissed']
player_match_batting['is_fifty'] = (
    (player_match_batting['runs'] >= 50) & (player_match_batting['runs'] < 100)
).astype(int)
player_match_batting['is_hundred'] = (player_match_batting['runs'] >= 100).astype(int)
player_match_batting['is_duck'] = (
    (player_match_batting['runs'] == 0) & (player_match_batting['dismissed'] == 1)
).astype(int)

# Add result for player
player_match_batting = player_match_batting.merge(
    matches_df[['match_id', 'winner']], on='match_id', how='left'
)
player_match_batting['result'] = player_match_batting.apply(
    lambda r: 'Won' if r['winner'] == r['batting_team'] else 'Lost', axis=1
)

print(f"Batting: {len(player_match_batting):,} player-match rows, {player_match_batting['player'].nunique()} unique players")

# ============================================================
# STEP 7 - PLAYER MATCH-BY-MATCH BOWLING STATS
# ============================================================

print("Computing player match-by-match bowling stats...")

bowl_df = deliveries_df.copy()
bowl_df['is_wide'] = bowl_df['wides'].fillna(0) > 0
bowl_df['is_noball'] = bowl_df['noballs'].fillna(0) > 0
bowl_df['is_legal'] = (~bowl_df['is_wide'] & ~bowl_df['is_noball']).astype(int)
bowl_df['total_runs_given'] = (
    bowl_df['runs_off_bat'].fillna(0) + bowl_df['extras'].fillna(0)
).astype(int)

# Wickets - exclude run outs (bowler doesn't get credit)
if 'wicket_type' in bowl_df.columns:
    bowl_df['bowler_wicket'] = (
        bowl_df['wicket_type'].fillna('').isin([
            'bowled', 'caught', 'lbw', 'stumped',
            'caught and bowled', 'hit wicket'
        ])
    ).astype(int)
else:
    bowl_df['bowler_wicket'] = 0

player_match_bowling = bowl_df.groupby(
    ['match_id', 'bowler', 'bowling_team', 'year', 'date', 'venue']
).agg(
    balls_bowled=('is_legal', 'sum'),
    runs_given=('total_runs_given', 'sum'),
    wickets=('bowler_wicket', 'sum'),
    wides=('is_wide', 'sum'),
    noballs=('is_noball', 'sum'),
).reset_index()

player_match_bowling = player_match_bowling.rename(columns={'bowler': 'player'})
player_match_bowling['overs'] = (
    player_match_bowling['balls_bowled'] // 6 +
    (player_match_bowling['balls_bowled'] % 6) / 10
).round(1)
player_match_bowling['economy'] = (
    player_match_bowling['runs_given'] /
    (player_match_bowling['balls_bowled'] / 6)
).round(2).replace([np.inf, -np.inf], 0).fillna(0)

player_match_bowling = player_match_bowling.merge(
    matches_df[['match_id', 'winner']], on='match_id', how='left'
)
player_match_bowling['result'] = player_match_bowling.apply(
    lambda r: 'Won' if r['winner'] == r['bowling_team'] else 'Lost', axis=1
)

print(f"Bowling: {len(player_match_bowling):,} player-match rows, {player_match_bowling['player'].nunique()} unique players")

# ============================================================
# STEP 8 - CAREER SUMMARY PER PLAYER
# ============================================================

print("Computing career summaries...")

career_batting = player_match_batting.groupby('player').agg(
    matches_batted=('match_id', 'nunique'),
    total_runs=('runs', 'sum'),
    total_balls=('balls_faced', 'sum'),
    total_fours=('fours', 'sum'),
    total_sixes=('sixes', 'sum'),
    fifties=('is_fifty', 'sum'),
    hundreds=('is_hundred', 'sum'),
    ducks=('is_duck', 'sum'),
    not_outs=('not_out', 'sum'),
    dismissed=('dismissed', 'sum'),
    highest_score=('runs', 'max'),
    seasons_active_bat=('year', 'nunique'),
    first_season_bat=('year', 'min'),
    last_season_bat=('year', 'max'),
).reset_index()

career_batting['batting_avg'] = (
    career_batting['total_runs'] /
    career_batting['dismissed'].replace(0, np.nan)
).round(2).fillna(career_batting['total_runs'])

career_batting['strike_rate'] = (
    career_batting['total_runs'] / career_batting['total_balls'] * 100
).round(2).replace([np.inf, -np.inf], 0).fillna(0)

career_bowling = player_match_bowling.groupby('player').agg(
    matches_bowled=('match_id', 'nunique'),
    total_wickets=('wickets', 'sum'),
    total_runs_given=('runs_given', 'sum'),
    total_balls_bowled=('balls_bowled', 'sum'),
    best_wickets=('wickets', 'max'),
    seasons_active_bowl=('year', 'nunique'),
    first_season_bowl=('year', 'min'),
    last_season_bowl=('year', 'max'),
).reset_index()

career_bowling['economy'] = (
    career_bowling['total_runs_given'] /
    (career_bowling['total_balls_bowled'] / 6)
).round(2).replace([np.inf, -np.inf], 0).fillna(0)

career_bowling['bowling_avg'] = (
    career_bowling['total_runs_given'] /
    career_bowling['total_wickets'].replace(0, np.nan)
).round(2).fillna(999)

career_summary = career_batting.merge(career_bowling, on='player', how='outer')
career_summary['total_matches'] = career_summary[
    ['matches_batted', 'matches_bowled']
].max(axis=1).fillna(0).astype(int)

print(f"Career summary: {len(career_summary)} unique players")

# ============================================================
# STEP 9 - SEASON-WISE PLAYER SUMMARY
# ============================================================

print("Computing season-wise player summaries...")

season_batting = player_match_batting.groupby(['player', 'year']).agg(
    matches=('match_id', 'nunique'),
    runs=('runs', 'sum'),
    balls=('balls_faced', 'sum'),
    fours=('fours', 'sum'),
    sixes=('sixes', 'sum'),
    fifties=('is_fifty', 'sum'),
    hundreds=('is_hundred', 'sum'),
    highest=('runs', 'max'),
    dismissed=('dismissed', 'sum'),
    not_outs=('not_out', 'sum'),
).reset_index()

season_batting['avg'] = (
    season_batting['runs'] / season_batting['dismissed'].replace(0, np.nan)
).round(2).fillna(season_batting['runs'])

season_batting['sr'] = (
    season_batting['runs'] / season_batting['balls'] * 100
).round(2).replace([np.inf, -np.inf], 0).fillna(0)

season_bowling = player_match_bowling.groupby(['player', 'year']).agg(
    matches=('match_id', 'nunique'),
    wickets=('wickets', 'sum'),
    runs_given=('runs_given', 'sum'),
    balls_bowled=('balls_bowled', 'sum'),
    best=('wickets', 'max'),
).reset_index()

season_bowling['economy'] = (
    season_bowling['runs_given'] / (season_bowling['balls_bowled'] / 6)
).round(2).replace([np.inf, -np.inf], 0).fillna(0)

season_bowling['avg'] = (
    season_bowling['runs_given'] / season_bowling['wickets'].replace(0, np.nan)
).round(2).fillna(999)

print(f"Season batting: {len(season_batting):,} rows | Season bowling: {len(season_bowling):,} rows")

# ============================================================
# STEP 10 - PLAYER VS PLAYER HEAD-TO-HEAD (BATTER vs BOWLER)
# ============================================================

print("Computing batter vs bowler head-to-head...")

h2h = deliveries_df.copy()
h2h['is_wide'] = h2h['wides'].fillna(0) > 0
h2h['is_legal'] = (~h2h['is_wide']).astype(int)
h2h['runs_off_bat'] = h2h['runs_off_bat'].fillna(0).astype(int)
if 'wicket_type' in h2h.columns:
    h2h['dismissed_by_bowler'] = (
        h2h['wicket_type'].fillna('').isin([
            'bowled', 'caught', 'lbw', 'stumped',
            'caught and bowled', 'hit wicket'
        ])
    ).astype(int)
else:
    h2h['dismissed_by_bowler'] = 0

bvb = h2h.groupby(['striker', 'bowler']).agg(
    balls=('is_legal', 'sum'),
    runs=('runs_off_bat', 'sum'),
    dismissals=('dismissed_by_bowler', 'sum'),
    matches=('match_id', 'nunique'),
).reset_index()

bvb = bvb.rename(columns={'striker': 'batter'})
bvb['sr'] = (bvb['runs'] / bvb['balls'] * 100).round(2).replace([np.inf, -np.inf], 0)
bvb = bvb[bvb['balls'] >= 6]

print(f"Head-to-head matchups: {len(bvb):,} batter-bowler pairs")

# ============================================================
# STEP 11 - PLAYER MATCH PARTICIPATION TABLE
# ============================================================

print("Building master player-match participation table...")

batters_in_match = player_match_batting[['match_id', 'player', 'batting_team', 'year']].copy()
batters_in_match['role'] = 'batter'

bowlers_in_match = player_match_bowling[['match_id', 'player', 'bowling_team', 'year']].copy()
bowlers_in_match = bowlers_in_match.rename(columns={'bowling_team': 'batting_team'})
bowlers_in_match['role'] = 'bowler'

participation = pd.concat([batters_in_match, bowlers_in_match], ignore_index=True)
participation = participation.drop_duplicates(subset=['match_id', 'player'])
participation_count = participation.groupby('player').agg(
    matches_played=('match_id', 'nunique'),
    seasons=('year', 'nunique'),
    first_year=('year', 'min'),
    last_year=('year', 'max'),
).reset_index().sort_values('matches_played', ascending=False)

print(f"Participation: {len(participation_count)} players tracked")
print(f"\nTop 10 players by matches played:")
print(participation_count.head(10).to_string(index=False))

# ============================================================
# STEP 12 - SAVE ALL OUTPUTS
# ============================================================

output_dir = 'ipl_player_data_output'
os.makedirs(output_dir, exist_ok=True)

FILTER_FROM = 2008

def save(df, name):
    path = os.path.join(output_dir, name)
    df.to_csv(path, index=False)
    print(f"Saved: {name} ({len(df):,} rows)")

save(matches_df[matches_df['year'] >= FILTER_FROM], 'matches_all.csv')
save(player_match_batting[player_match_batting['year'] >= FILTER_FROM], 'player_match_batting.csv')
save(player_match_bowling[player_match_bowling['year'] >= FILTER_FROM], 'player_match_bowling.csv')
save(career_summary, 'player_career_summary.csv')
save(season_batting[season_batting['year'] >= FILTER_FROM], 'player_season_batting.csv')
save(season_bowling[season_bowling['year'] >= FILTER_FROM], 'player_season_bowling.csv')
save(bvb, 'batter_vs_bowler_h2h.csv')
save(participation_count, 'player_match_participation.csv')

print("""
==================================================
        ALL DONE - IPL DATA EXTRACTION
==================================================
  Output folder : ipl_player_data_output/
  Files generated:
    matches_all.csv
    player_match_batting.csv
    player_match_bowling.csv
    player_career_summary.csv
    player_season_batting.csv
    player_season_bowling.csv
    batter_vs_bowler_h2h.csv
    player_match_participation.csv
==================================================
""")
