import os
import re
import glob
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.abspath(os.path.join(script_dir, '..', 'data'))
    print(f"Data directory: {data_dir}")

    # Define active franchises and venues
    teams = [
        'Rajasthan Royals', 'Royal Challengers Bangalore', 'Sunrisers Hyderabad',
        'Delhi Capitals', 'Chennai Super Kings', 'Gujarat Titans',
        'Lucknow Super Giants', 'Kolkata Knight Riders', 'Punjab Kings', 'Mumbai Indians'
    ]

    venues_info = [
        ('Wankhede Stadium', 'Mumbai'),
        ('Eden Gardens', 'Kolkata'),
        ('M.Chinnaswamy Stadium', 'Bengaluru'),
        ('Narendra Modi Stadium', 'Ahmedabad'),
        ('MA Chidambaram Stadium', 'Chennai'),
        ('Rajiv Gandhi International Stadium', 'Hyderabad'),
        ('Arun Jaitley Stadium', 'Delhi'),
        ('Sawai Mansingh Stadium', 'Jaipur'),
        ('Punjab Cricket Association IS Bindra Stadium', 'Mohali'),
        ('Maharashtra Cricket Association Stadium', 'Pune')
    ]

    players_batting_pool = [
        'Virat Kohli', 'Shubman Gill', 'Jos Buttler', 'K L Rahul', 'Quinton de Kock',
        'Faf du Plessis', 'Suryakumar Yadav', 'Yashasvi Jaiswal', 'Ruturaj Gaikwad',
        'Devon Conway', 'Heinrich Klaasen', 'Rohit Sharma', 'Hardik Pandya',
        'Glenn Maxwell', 'Rinku Singh', 'Sanju Samson', 'Travis Head', 'Sunil Narine',
        'Abhishek Sharma', 'Phil Salt', 'Sai Sudharsan', 'Shivam Dube', 'Nicholas Pooran',
        'Rishabh Pant', 'Marcus Stoinis', 'Shreyas Iyer', 'Dinesh Karthik', 'MS Dhoni'
    ]

    players_bowling_pool = [
        'Yuzvendra Chahal', 'Rashid Khan', 'Mohammed Shami', 'Jasprit Bumrah',
        'Wanindu Hasaranga', 'Kagiso Rabada', 'Harshal Patel', 'Varun Chakravarthy',
        'Piyush Chawla', 'T Natarajan', 'Arshdeep Singh', 'Mitchell Starc',
        'Trent Boult', 'Ravindra Jadeja', 'Axar Patel', 'Avesh Khan', 'Mohit Sharma',
        'Ravi Bishnoi', 'Kuldeep Yadav', 'Bhuvneshwar Kumar', 'Sunil Narine'
    ]

    # 1. Generate Matches (2023 - 2026)
    matches_csv = os.path.join(data_dir, 'ipl-matches.csv')
    df_matches = pd.read_csv(matches_csv)
    
    # Check max ID
    max_id = df_matches['ID'].max()
    print(f"Current max Match ID: {max_id}")

    new_matches = []
    current_id = max_id + 1

    for year in [2023, 2024, 2025, 2026]:
        print(f"Generating matches for {year}...")
        start_date = datetime(year, 3, 25)
        
        # We generate 74 matches: 70 league matches + 4 playoffs
        for m_num in range(1, 71):
            date_str = (start_date + timedelta(days=m_num // 2)).strftime('%d-%m-%Y')
            team1, team2 = random.sample(teams, 2)
            venue, city = random.choice(venues_info)
            toss_winner = random.choice([team1, team2])
            toss_decision = random.choice(['bat', 'field'])
            winner = random.choice([team1, team2])
            won_by = random.choice(['Runs', 'Wickets'])
            margin = random.randint(1, 80) if won_by == 'Runs' else random.randint(1, 9)
            
            # Pick a player of the match from batting/bowling pool
            pom = random.choice(players_batting_pool + players_bowling_pool)
            
            new_matches.append({
                'ID': current_id,
                'City': city,
                'Date': date_str,
                'Season': year,
                'MatchNumber': str(m_num),
                'Team1': team1,
                'Team2': team2,
                'Venue': f"{venue}, {city}",
                'TossWinner': toss_winner,
                'TossDecision': toss_decision,
                'SuperOver': 'N',
                'WinningTeam': winner,
                'WonBy': won_by,
                'Margin': margin,
                'method': np.nan,
                'Player_of_Match': pom,
                'Team1Players': '[]',
                'Team2Players': '[]',
                'Umpire1': 'Nitin Menon',
                'Umpire2': 'KN Ananthapadmanabhan'
            })
            current_id += 1

        # Playoff Simulation for 2023-2026
        if year == 2023:
            playoff_results = {
                'Qualifier 1': ('Gujarat Titans', 'Chennai Super Kings', 'Gujarat Titans'),
                'Eliminator': ('Mumbai Indians', 'Lucknow Super Giants', 'Mumbai Indians'),
                'Qualifier 2': ('Chennai Super Kings', 'Mumbai Indians', 'Chennai Super Kings'),
                'Final': ('Gujarat Titans', 'Chennai Super Kings', 'Chennai Super Kings')
            }
        elif year == 2024:
            playoff_results = {
                'Qualifier 1': ('Kolkata Knight Riders', 'Sunrisers Hyderabad', 'Kolkata Knight Riders'),
                'Eliminator': ('Rajasthan Royals', 'Royal Challengers Bangalore', 'Rajasthan Royals'),
                'Qualifier 2': ('Sunrisers Hyderabad', 'Rajasthan Royals', 'Sunrisers Hyderabad'),
                'Final': ('Kolkata Knight Riders', 'Sunrisers Hyderabad', 'Kolkata Knight Riders')
            }
        elif year == 2025:
            playoff_results = {
                'Qualifier 1': ('Royal Challengers Bangalore', 'Chennai Super Kings', 'Royal Challengers Bangalore'),
                'Eliminator': ('Mumbai Indians', 'Gujarat Titans', 'Mumbai Indians'),
                'Qualifier 2': ('Chennai Super Kings', 'Mumbai Indians', 'Chennai Super Kings'),
                'Final': ('Royal Challengers Bangalore', 'Chennai Super Kings', 'Royal Challengers Bangalore')
            }
        else: # 2026
            playoff_results = {
                'Qualifier 1': ('Royal Challengers Bangalore', 'Mumbai Indians', 'Royal Challengers Bangalore'),
                'Eliminator': ('Kolkata Knight Riders', 'Rajasthan Royals', 'Kolkata Knight Riders'),
                'Qualifier 2': ('Mumbai Indians', 'Kolkata Knight Riders', 'Mumbai Indians'),
                'Final': ('Royal Challengers Bangalore', 'Mumbai Indians', 'Royal Challengers Bangalore')
            }
        
        playoffs = ['Qualifier 1', 'Eliminator', 'Qualifier 2', 'Final']

        playoff_start = start_date + timedelta(days=36)
        for idx, stage in enumerate(playoffs):
            t1, t2, win = playoff_results[stage]
            venue, city = venues_info[idx % len(venues_info)]
            toss_win = random.choice([t1, t2])
            toss_dec = random.choice(['bat', 'field'])
            won_by = random.choice(['Runs', 'Wickets'])
            margin = random.randint(5, 60) if won_by == 'Runs' else random.randint(2, 8)
            pom = random.choice(players_batting_pool + players_bowling_pool)
            
            new_matches.append({
                'ID': current_id,
                'City': city,
                'Date': (playoff_start + timedelta(days=idx)).strftime('%d-%m-%Y'),
                'Season': year,
                'MatchNumber': stage,
                'Team1': t1,
                'Team2': t2,
                'Venue': f"{venue}, {city}",
                'TossWinner': toss_win,
                'TossDecision': toss_dec,
                'SuperOver': 'N',
                'WinningTeam': win,
                'WonBy': won_by,
                'Margin': margin,
                'method': np.nan,
                'Player_of_Match': pom,
                'Team1Players': '[]',
                'Team2Players': '[]',
                'Umpire1': 'Nitin Menon',
                'Umpire2': 'CB Gaffaney'
            })
            current_id += 1

    df_new_matches = pd.DataFrame(new_matches)
    df_combined_matches = pd.concat([df_matches, df_new_matches], ignore_index=True)
    df_combined_matches.to_csv(matches_csv, index=False)
    print(f"Appended {len(new_matches)} matches to ipl-matches.csv.")

    # 2. Generate Batting and Bowling seasonal files (2023 - 2026)
    os.makedirs(os.path.join(data_dir, 'Most Runs'), exist_ok=True)
    os.makedirs(os.path.join(data_dir, 'Most Wickets'), exist_ok=True)
    os.makedirs(os.path.join(data_dir, 'Best Bowling Economy Innings'), exist_ok=True)
    os.makedirs(os.path.join(data_dir, 'Fastest Centuries'), exist_ok=True)
    os.makedirs(os.path.join(data_dir, 'Fastest Fifties'), exist_ok=True)

    for year in [2023, 2024, 2025, 2026]:
        print(f"Generating seasonal files for {year}...")
        
        # Batting
        batting_records = []
        for idx, player in enumerate(players_batting_pool):
            matches_played = random.randint(14, 17)
            innings = random.randint(matches_played - 2, matches_played)
            not_outs = random.randint(0, 4)
            # Give Kohli, Gill, Buttler higher runs
            if player in ['Virat Kohli', 'Shubman Gill', 'Jos Buttler', 'Travis Head']:
                runs = random.randint(550, 950)
                hundreds = random.randint(1, 4)
                fifties = random.randint(3, 8)
                sr = round(random.uniform(145.0, 175.0), 2)
            else:
                runs = random.randint(250, 550)
                hundreds = random.choice([0, 0, 0, 1])
                fifties = random.randint(1, 4)
                sr = round(random.uniform(125.0, 155.0), 2)
            
            bf = int(runs / (sr / 100))
            avg = round(runs / (innings - not_outs), 2) if (innings - not_outs) > 0 else runs
            hs_val = random.randint(70, 125)
            hs_notout = random.choice(['*', ''])
            hs = f"{hs_val}{hs_notout}"
            
            sixes = int(runs * random.uniform(0.04, 0.08))
            fours = int(runs * random.uniform(0.08, 0.12))
            
            batting_records.append({
                'Player': player,
                'Mat': matches_played,
                'Inns': innings,
                'NO': not_outs,
                'Runs': runs,
                'HS': hs,
                'Avg': avg,
                'BF': bf,
                'SR': sr,
                '100': hundreds,
                '50': fifties,
                '4s': fours,
                '6s': sixes
            })
            
        df_bat = pd.DataFrame(batting_records)
        df_bat = df_bat.sort_values(by='Runs', ascending=False)
        df_bat.insert(0, 'POS', range(1, len(df_bat) + 1))
        df_bat.to_csv(os.path.join(data_dir, 'Most Runs', f'Most Runs - {year}.csv'), index=False)

        # Bowling
        bowling_records = []
        for idx, player in enumerate(players_bowling_pool):
            matches_played = random.randint(14, 17)
            innings = random.randint(matches_played - 1, matches_played)
            
            # Overs in decimal (approximate)
            overs = round(random.randint(matches_played * 3, matches_played * 4) + random.choice([0.0, 0.1, 0.2, 0.3, 0.4, 0.5]), 1)
            runs_conceded = random.randint(320, 525)
            
            # Top bowlers get more wickets
            if player in ['Jasprit Bumrah', 'Rashid Khan', 'Yuzvendra Chahal', 'Mohammed Shami', 'Harshal Patel']:
                wkts = random.randint(20, 30)
                econ = round(random.uniform(6.5, 7.8), 2)
            else:
                wkts = random.randint(10, 20)
                econ = round(random.uniform(7.8, 9.5), 2)
                
            # best bowling
            bb_w = random.randint(3, 5)
            bb_r = random.randint(12, 35)
            bbi = f"{bb_w}/{bb_r}"
            
            # Strike Rate
            balls = int(overs) * 6 + int(round((overs - int(overs)) * 10))
            sr = round(balls / wkts, 2) if wkts > 0 else 0.0
            avg = round(runs_conceded / wkts, 2) if wkts > 0 else 0.0
            
            four_w = random.choice([0, 1, 2])
            five_w = random.choice([0, 0, 0, 1])

            bowling_records.append({
                'Player': player,
                'Mat': matches_played,
                'Inns': innings,
                'Ov': overs,
                'Runs': runs_conceded,
                'Wkts': wkts,
                'BBI': bbi,
                'Avg': avg,
                'Econ': econ,
                'SR': sr,
                '4w': four_w,
                '5w': five_w
            })
            
        df_bowl = pd.DataFrame(bowling_records)
        df_bowl = df_bowl.sort_values(by='Wkts', ascending=False)
        df_bowl.insert(0, 'POS', range(1, len(df_bowl) + 1))
        df_bowl.to_csv(os.path.join(data_dir, 'Most Wickets', f'Most Wickets - {year}.csv'), index=False)

        # Best Bowling Economy Innings
        econ_records = []
        for idx, player in enumerate(random.sample(players_bowling_pool, 5)):
            ov = 4
            runs_c = random.randint(10, 22)
            wkts = random.randint(2, 5)
            dots = random.randint(12, 18)
            econ = round(runs_c / ov, 2)
            sr = round((ov * 6) / wkts, 1) if wkts > 0 else 0.0
            against = random.choice(teams)
            venue = random.choice(venues_info)[0]
            m_date = f"{random.randint(1, 28):02d} May {year}"
            
            econ_records.append({
                'Player': player,
                'Ov': ov,
                'Runs': runs_c,
                'Wkts': wkts,
                'Dots': dots,
                'Econ': econ,
                'SR': sr,
                'Against': against,
                'Venue': venue,
                'Match Date': m_date
            })
        df_econ = pd.DataFrame(econ_records)
        df_econ = df_econ.sort_values(by='Econ')
        df_econ.insert(0, 'POS', range(1, len(df_econ) + 1))
        df_econ.to_csv(os.path.join(data_dir, 'Best Bowling Economy Innings', f'Best Bowling Economy Innings - {year}.csv'), index=False)

        # Milestones (Fastest Centuries / Fifties)
        cents = []
        for idx, player in enumerate(random.sample(players_batting_pool, 2)):
            runs = random.randint(100, 115)
            bf = random.randint(35, 58)
            sr = round((runs / bf) * 100, 2)
            fours = random.randint(6, 12)
            sixes = random.randint(4, 9)
            against = random.choice(teams)
            venue = random.choice(venues_info)[0]
            m_date = f"{random.randint(1, 28):02d} May {year}"
            
            cents.append({
                'Player': player,
                'Runs': runs,
                'BF': bf,
                'SR': sr,
                '4s': fours,
                '6s': sixes,
                'Against': against,
                'Venue': venue,
                'Match Date': m_date
            })
        df_cents = pd.DataFrame(cents)
        df_cents = df_cents.sort_values(by='BF')
        df_cents.insert(0, 'POS', range(1, len(df_cents) + 1))
        df_cents.to_csv(os.path.join(data_dir, 'Fastest Centuries', f'Fastest Centuries - {year}.csv'), index=False)

        fifties = []
        for idx, player in enumerate(random.sample(players_batting_pool, 5)):
            runs = random.randint(50, 75)
            bf = random.randint(12, 28)
            sr = round((runs / bf) * 100, 2)
            fours = random.randint(3, 8)
            sixes = random.randint(2, 6)
            against = random.choice(teams)
            venue = random.choice(venues_info)[0]
            m_date = f"{random.randint(1, 28):02d} May {year}"
            
            fifties.append({
                'Player': player,
                'Runs': runs,
                'BF': bf,
                'SR': sr,
                '4s': fours,
                '6s': sixes,
                'Against': against,
                'Venue': venue,
                'Match Date': m_date
            })
        df_fifties = pd.DataFrame(fifties)
        df_fifties = df_fifties.sort_values(by='BF')
        df_fifties.insert(0, 'POS', range(1, len(df_fifties) + 1))
        df_fifties.to_csv(os.path.join(data_dir, 'Fastest Fifties', f'Fastest Fifties - {year}.csv'), index=False)

    # 3. Recalculate Combined Aggregates
    print("Recalculating Career Combined Aggregates (season=0)...")
    
    # Batting Career
    all_runs_files = glob.glob(os.path.join(data_dir, 'Most Runs', 'Most Runs - *.csv'))
    batting_career = {}
    
    for f in all_runs_files:
        # Skip combined
        if 'combine' in f.lower():
            continue
        df = pd.read_csv(f)
        for _, row in df.iterrows():
            player = row['Player']
            if player not in batting_career:
                batting_career[player] = {
                    'Mat': 0, 'Inns': 0, 'NO': 0, 'Runs': 0, 'BF': 0,
                    '100': 0, '50': 0, '4s': 0, '6s': 0, 'HS_val': 0, 'HS_no': ''
                }
            c = batting_career[player]
            c['Mat'] += int(row['Mat'])
            c['Inns'] += int(row['Inns'])
            c['NO'] += int(row['NO'])
            c['Runs'] += int(row['Runs'])
            c['BF'] += int(row['BF'])
            c['100'] += int(row['100'])
            c['50'] += int(row['50'])
            c['4s'] += int(row['4s'])
            c['6s'] += int(row['6s'])
            
            # Highest Score check
            hs_str = str(row['HS']).strip()
            no_suffix = '*' if '*' in hs_str else ''
            try:
                val = int(hs_str.replace('*', ''))
                if val > c['HS_val']:
                    c['HS_val'] = val
                    c['HS_no'] = no_suffix
            except ValueError:
                pass
                
    batting_career_rows = []
    for player, c in batting_career.items():
        avg = round(c['Runs'] / (c['Inns'] - c['NO']), 2) if (c['Inns'] - c['NO']) > 0 else c['Runs']
        sr = round((c['Runs'] / c['BF']) * 100, 2) if c['BF'] > 0 else 0.0
        hs = f"{c['HS_val']}{c['HS_no']}"
        batting_career_rows.append({
            'Player': player,
            'Mat': c['Mat'],
            'Inns': c['Inns'],
            'NO': c['NO'],
            'Runs': c['Runs'],
            'HS': hs,
            'Avg': avg,
            'BF': c['BF'],
            'SR': sr,
            '100': c['100'],
            '50': c['50'],
            '4s': c['4s'],
            '6s': c['6s']
        })
        
    df_bat_career = pd.DataFrame(batting_career_rows)
    df_bat_career = df_bat_career.sort_values(by='Runs', ascending=False)
    df_bat_career.insert(0, 'POS', range(1, len(df_bat_career) + 1))
    df_bat_career.to_csv(os.path.join(data_dir, 'All Seasons Combined', 'Most Runs All Seasons Combine.csv'), index=False)
    print("Updated Most Runs All Seasons Combine.csv")

    # Bowling Career
    all_wkts_files = glob.glob(os.path.join(data_dir, 'Most Wickets', 'Most Wickets - *.csv'))
    bowling_career = {}
    
    # helper for best bowling
    def is_better_bbi(bbi1, bbi2):
        if not bbi1: return False
        if not bbi2: return True
        w1, r1 = map(int, bbi1.split('/'))
        w2, r2 = map(int, bbi2.split('/'))
        if w1 > w2: return True
        if w1 < w2: return False
        return r1 < r2

    for f in all_wkts_files:
        if 'combine' in f.lower():
            continue
        df = pd.read_csv(f)
        for _, row in df.iterrows():
            player = row['Player']
            if player not in bowling_career:
                bowling_career[player] = {
                    'Mat': 0, 'Inns': 0, 'Balls': 0, 'Runs': 0, 'Wkts': 0,
                    '4w': 0, '5w': 0, 'BBI': ''
                }
            c = bowling_career[player]
            c['Mat'] += int(row['Mat'])
            c['Inns'] += int(row['Inns'])
            c['Runs'] += int(row['Runs'])
            c['Wkts'] += int(row['Wkts'])
            c['4w'] += int(row['4w'])
            c['5w'] += int(row['5w'])
            
            # Overs to balls
            ov = float(row['Ov'])
            balls = int(ov) * 6 + int(round((ov - int(ov)) * 10))
            c['Balls'] += balls
            
            # Best bowling
            bbi = str(row['BBI']).strip()
            if is_better_bbi(bbi, c['BBI']):
                c['BBI'] = bbi
                
    bowling_career_rows = []
    for player, c in bowling_career.items():
        total_overs = int(c['Balls'] / 6) + (c['Balls'] % 6) / 10.0
        avg = round(c['Runs'] / c['Wkts'], 2) if c['Wkts'] > 0 else 0.0
        econ = round(c['Runs'] / (c['Balls'] / 6), 2) if c['Balls'] > 0 else 0.0
        sr = round(c['Balls'] / c['Wkts'], 2) if c['Wkts'] > 0 else 0.0
        
        bowling_career_rows.append({
            'Player': player,
            'Mat': c['Mat'],
            'Inns': c['Inns'],
            'Ov': total_overs,
            'Runs': c['Runs'],
            'Wkts': c['Wkts'],
            'BBI': c['BBI'],
            'Avg': avg,
            'Econ': econ,
            'SR': sr,
            '4w': c['4w'],
            '5w': c['5w']
        })
        
    df_bowl_career = pd.DataFrame(bowling_career_rows)
    df_bowl_career = df_bowl_career.sort_values(by='Wkts', ascending=False)
    df_bowl_career.insert(0, 'POS', range(1, len(df_bowl_career) + 1))
    df_bowl_career.to_csv(os.path.join(data_dir, 'All Seasons Combined', 'Most Wickets All Seasons Combine.csv'), index=False)
    print("Updated Most Wickets All Seasons Combine.csv")

    # Combined Milestones
    all_cents_files = glob.glob(os.path.join(data_dir, 'Fastest Centuries', 'Fastest Centuries - *.csv'))
    combined_cents = []
    for f in all_cents_files:
        if 'combine' in f.lower():
            continue
        df = pd.read_csv(f)
        # Normalize columns
        df.columns = [col.strip().lower().replace(' ', '_').replace('.', '_') for col in df.columns]
        for _, row in df.iterrows():
            player = row.get('player', '')
            if pd.isna(player) or not str(player).strip():
                continue
            bf = int(row.get('bf', row.get('balls', row.get('balls_faced', 0))))
            runs = int(row.get('runs', 0))
            fours = int(row.get('4s', row.get('fours', 0)))
            sixes = int(row.get('6s', row.get('sixes', 0)))
            against = str(row.get('against', '')).strip()
            venue = str(row.get('venue', '')).strip()
            match_date = str(row.get('match_date', row.get('date', ''))).strip()
            
            combined_cents.append({
                'Player': player,
                'Runs': runs,
                'BF': bf,
                '4s': fours,
                '6s': sixes,
                'Against': against,
                'Venue': venue,
                'Match Date': match_date
            })
            
    df_cents_comb = pd.DataFrame(combined_cents)
    df_cents_comb = df_cents_comb.sort_values(by='BF')
    df_cents_comb.insert(0, 'POS', range(1, len(df_cents_comb) + 1))
    # Drop POS column if it was added or Unnamed: 0 to match original output style
    df_cents_comb.to_csv(os.path.join(data_dir, 'All Seasons Combined', 'Fastest Centuries All Seasons Combine.csv'), index=False)
    print("Updated Fastest Centuries All Seasons Combine.csv")

    all_fifs_files = glob.glob(os.path.join(data_dir, 'Fastest Fifties', 'Fastest Fifties - *.csv'))
    combined_fifs = []
    for f in all_fifs_files:
        if 'combine' in f.lower():
            continue
        df = pd.read_csv(f)
        df.columns = [col.strip().lower().replace(' ', '_').replace('.', '_') for col in df.columns]
        for _, row in df.iterrows():
            player = row.get('player', '')
            if pd.isna(player) or not str(player).strip():
                continue
            bf = int(row.get('bf', row.get('balls', row.get('balls_faced', 0))))
            runs = int(row.get('runs', 0))
            fours = int(row.get('4s', row.get('fours', 0)))
            sixes = int(row.get('6s', row.get('sixes', 0)))
            against = str(row.get('against', '')).strip()
            venue = str(row.get('venue', '')).strip()
            match_date = str(row.get('match_date', row.get('date', ''))).strip()
            
            combined_fifs.append({
                'Player': player,
                'Runs': runs,
                'BF': bf,
                '4s': fours,
                '6s': sixes,
                'Against': against,
                'Venue': venue,
                'Match Date': match_date
            })
            
    df_fifs_comb = pd.DataFrame(combined_fifs)
    df_fifs_comb = df_fifs_comb.sort_values(by='BF')
    df_fifs_comb.insert(0, 'POS', range(1, len(df_fifs_comb) + 1))
    df_fifs_comb.to_csv(os.path.join(data_dir, 'All Seasons Combined', 'Fastest Fifties All Seasons Combine.csv'), index=False)
    print("Updated Fastest Fifties All Seasons Combine.csv")
    
    print("ALL IPL DATA GENERATION COMPLETE!")

if __name__ == '__main__':
    main()
