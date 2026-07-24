import os
import json
import csv
import sqlite3
import requests
import re
from typing import Dict, List, Set, Tuple

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(BACKEND_DIR, "data", "squads")

PLAYER_NAME_MAPPING = {
    'AT Rayudu': 'Ambati Rayudu',
    'AUK Pathan': 'Asad Pathan',
    'CH Gayle': 'Chris Gayle',
    'DA Warner': 'David Warner',
    'G Gambhir': 'Gautam Gambhir',
    'GJ Maxwell': 'Glenn Maxwell',
    'I Sharma': 'Ishant Sharma',
    'IK Pathan': 'Irfan Pathan',
    'JM Sharma': 'Jitesh Sharma',
    'KA Pollard': 'Kieron Pollard',
    'KD Karthik': 'Dinesh Karthik',
    'KV Sharma': 'Karn Sharma',
    'MM Sharma': 'Mohit Sharma',
    'NK Patel': 'Niraj Patel',
    'R Dhawan': 'Rishi Dhawan',
    'R Sharma': 'Rahul Sharma',
    'RA Jadeja': 'Ravindra Jadeja',
    'RG Sharma': 'Rohit Sharma',
    'RR Pant': 'Rishabh Pant',
    'RV Uthappa': 'Robin Uthappa',
    'S Dhawan': 'Shikhar Dhawan',
    'SK Raina': 'Suresh Raina',
    'SR Watson': 'Shane Watson',
    'SS Iyer': 'Shreyas Iyer',
    'SV Samson': 'Sanju Samson',
    'T Kohli': 'Taruwar Kohli',
    'V Kohli': 'Virat Kohli',
    'VR Iyer': 'Venkatesh Iyer',
    'YK Pathan': 'Yusuf Pathan',
    'K L Rahul': 'KL Rahul',
}

WICKETKEEPERS = {
    'MS Dhoni', 'KD Karthik', 'PA Patel', 'RV Uthappa', 'WP Saha', 'AC Gilchrist', 
    'KC Sangakkara', 'MV Boucher', 'L Ronchi', 'YV Takawale', 'NV Ojha', 'Yashpal Singh', 
    'AP Tare', 'SP Goswami', 'Q de Kock', 'KL Rahul', 'Ishan Kishan', 'RR Pant', 
    'SV Samson', 'N Pooran', 'JC Buttler', 'HE van der Dussen', 'KS Bharat', 'JM Sharma', 
    'H Klaasen', 'PD Salt', 'Anuj Rawat', 'Dhruv Jurel', 'Jitesh Sharma', 'Prabhsimran Singh', 
    'Abishek Porel', 'SD Hope', 'DP Conway', 'TT Bavuma', 'MS Wade', 'T Stubbs', 
    'Aravelly Avanish', 'Kumar Kushagra', 'Luvnith Sisodia', 'Vishnu Vinod', 'B Indrajith', 
    'KK Nair', 'KM Jadhav', 'KB Arun Karthik', 'CM Gautam', 'BR Dunk', 'AJ Finch', 
    'SW Billings', 'UT Khawaja', 'PSP Handscomb', 'MS Bisla', 'AT Rayudu', 'BB McCullum', 
    'Kamran Akmal', 'DB Das', 'Dinesh Karthik', 'Robin Uthappa', 'Wriddhiman Saha', 
    'Kumar Sangakkara', 'Mark Boucher', 'Parthiv Patel', 'Naman Ojha', 'Quinton de Kock'
}

LEFT_HANDERS = {
    'Suresh Raina', 'SK Raina', 'Gautam Gambhir', 'G Gambhir', 'Shikhar Dhawan', 'S Dhawan',
    'Chris Gayle', 'CH Gayle', 'David Warner', 'DA Warner', 'Yuvraj Singh', 'Rishabh Pant',
    'RR Pant', 'Ishan Kishan', 'Ravindra Jadeja', 'RA Jadeja', 'Krunal Pandya', 'KH Pandya',
    'Quinton de Kock', 'Q de Kock', 'Nicholas Pooran', 'N Pooran', 'Rinku Singh',
    'Shimron Hetmyer', 'Devon Conway', 'DP Conway', 'Mitchell Santner', 'MJ Santner',
    'Eoin Morgan', 'Ben Stokes', 'Rachin Ravindra', 'R Ravindra', 'Tilak Varma', 'Shivam Dube',
    'Abhishek Sharma', 'Travis Head', 'TM Head', 'Sam Curran', 'SM Curran', 'Krunal Pandya',
    'Marcus Stoinis', 'MS Wade', 'Matthew Wade', 'Devdutt Padikkal', 'Nitish Rana', 'N Rana',
    'Washington Sundar', 'Harpreet Brar', 'Sai Sudharsan', 'Bhanuka Rajapaksa', 'Krunal Pandya',
    'Yashasvi Jaiswal', 'Shaun Marsh', 'SE Marsh', 'Sourav Ganguly', 'SC Ganguly',
    'Albie Morkel', 'JA Morkel', 'Matthew Hayden', 'ML Hayden', 'Michael Hussey', 'MEK Hussey',
    'JP Duminy', 'Daniel Vettori', 'DL Vettori', 'Shakib Al Hasan', 'Robin Uthappa'
}

SPIN_BOWLERS = {
    'Harbhajan Singh', 'R Ashwin', 'Ravichandran Ashwin', 'PP Chawla', 'Piyush Chawla',
    'A Kumble', 'Anil Kumble', 'PP Ojha', 'Pragyan Ojha', 'RA Jadeja', 'Ravindra Jadeja',
    'Yuzvendra Chahal', 'YS Chahal', 'Rashid Khan', 'Sunil Narine', 'SP Narine',
    'Krunal Pandya', 'KH Pandya', 'Kuldeep Yadav', 'KD Yadav', 'Axar Patel', 'AR Patel',
    'Varun Chakravarthy', 'CV Varun', 'Ravi Bishnoi', 'R Bishnoi', 'M Muralitharan',
    'Muttiah Muralitharan', 'Amit Mishra', 'A Mishra', 'SK Warne', 'Shane Warne',
    'Shakib Al Hasan', 'Karn Sharma', 'KV Sharma', 'Rahul Chahar', 'RD Chahar',
    'Noor Ahmad', 'Maheesh Theekshana', 'M Theekshana', 'Mitchell Santner', 'MJ Santner',
    'Washington Sundar', 'Harpreet Brar', 'Sai Kishore', 'R Sai Kishore', 'Swapnil Singh',
    'Mujeeb Ur Rahman', 'Sandeep Lamichhane', 'Imran Tahir', 'Shahbaz Ahmed', 'Mayank Markande'
}

def load_people_cricinfo_ids() -> Dict[str, str]:
    # Maps name in Cricsheet to Cricinfo ID
    people_csv = os.path.join(BACKEND_DIR, "data", "cricsheet", "people.csv")
    mapping = {}
    if os.path.exists(people_csv):
        with open(people_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row["name"].strip()
                cid = row["key_cricinfo"].strip()
                if name and cid:
                    mapping[name] = cid
    return mapping

def query_wikidata_countries(cricinfo_ids: List[str]) -> Dict[str, str]:
    # Queries Wikidata SPARQL for country names
    url = "https://query.wikidata.org/sparql"
    results = {}
    
    # Batch IDs into chunks of 150 to prevent query too long
    chunk_size = 150
    for i in range(0, len(cricinfo_ids), chunk_size):
        chunk = cricinfo_ids[i:i+chunk_size]
        values_str = " ".join(f'"{cid}"' for cid in chunk)
        
        query = f"""
        SELECT ?cricinfoId ?countryLabel WHERE {{
          VALUES ?cricinfoId {{ {values_str} }}
          ?item wdt:P2697 ?cricinfoId.
          ?item wdt:P27 ?country.
          ?country rdfs:label ?countryLabel.
          FILTER(LANG(?countryLabel) = "en")
        }}
        """
        try:
            r = requests.get(url, params={'format': 'json', 'query': query}, headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
            bindings = r.json().get("results", {}).get("bindings", [])
            for row in bindings:
                cid = row.get("cricinfoId", {}).get("value")
                country = row.get("countryLabel", {}).get("value")
                if cid and country:
                    results[cid] = country
        except Exception as e:
            print(f"SPARQL error for chunk {i}: {e}")
            
    return results

def main():
    print("Preparing squads data...")
    db_path = os.path.join(BACKEND_DIR, "db.sqlite3")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Load season rosters
    rosters_json_path = os.path.join(BACKEND_DIR, "data", "squads", "season_rosters.json")
    if not os.path.exists(rosters_json_path):
        print(f"Rosters file not found at {rosters_json_path}. Please run import script first.")
        return
        
    with open(rosters_json_path, "r", encoding="utf-8") as f:
        rosters_data = json.load(f)
    raw_rosters = rosters_data["rosters"]

    # Load extracted profiles
    profiles_path = os.path.join(BACKEND_DIR, "data", "squads", "extracted_profiles.json")
    if os.path.exists(profiles_path):
        with open(profiles_path, "r", encoding="utf-8") as f:
            base_profiles = json.load(f)
    else:
        base_profiles = {}

    # Get career stats for role heuristics
    cur.execute("SELECT player, runs, matches FROM ipl_battingrecord WHERE season=0")
    bat_stats = {r[0]: {"runs": r[1], "matches": r[2]} for r in cur.fetchall()}
    cur.execute("SELECT player, wickets, overs FROM ipl_bowlingrecord WHERE season=0")
    bowl_stats = {r[0]: {"wickets": r[1], "overs": r[2]} for r in cur.fetchall()}

    # Resolve all unique players in rosters
    all_roster_players = set()
    for team, seasons in raw_rosters.items():
        for season, players in seasons.items():
            for p in players:
                all_roster_players.add(p)

    print(f"Total unique players in Cricsheet rosters: {len(all_roster_players)}")

    # Map Cricsheet names to DB names
    db_player_names_lower = {}
    cur.execute("SELECT DISTINCT player FROM ipl_battingrecord WHERE season=0")
    for r in cur.fetchall():
        db_player_names_lower[r[0].lower()] = r[0]
    cur.execute("SELECT DISTINCT player FROM ipl_bowlingrecord WHERE season=0")
    for r in cur.fetchall():
        db_player_names_lower[r[0].lower()] = r[0]

    cricsheet_to_db_name = {}
    for p in all_roster_players:
        # Check mapping compilation
        mapped_name = PLAYER_NAME_MAPPING.get(p, p)
        # Check if mapped name matches case-insensitive in DB
        if mapped_name.lower() in db_player_names_lower:
            cricsheet_to_db_name[p] = db_player_names_lower[mapped_name.lower()]
        else:
            # Check if short name matches case-insensitive in DB
            if p.lower() in db_player_names_lower:
                cricsheet_to_db_name[p] = db_player_names_lower[p.lower()]
            else:
                # Fallback to mapped or original name
                cricsheet_to_db_name[p] = mapped_name

    # Load Cricinfo IDs
    name_to_cid = load_people_cricinfo_ids()
    print(f"Loaded {len(name_to_cid)} player cricinfo IDs from people.csv")

    # Determine Cricinfo IDs for missing players to query Wikidata
    query_cids = []
    cid_to_player = {}
    for p in all_roster_players:
        db_name = cricsheet_to_db_name[p]
        if db_name not in base_profiles and p not in base_profiles:
            cid = name_to_cid.get(p) or name_to_cid.get(db_name)
            if cid:
                query_cids.append(cid)
                cid_to_player[cid] = p

    print(f"Querying Wikidata SPARQL for country names of {len(query_cids)} players...")
    wikidata_countries = query_wikidata_countries(query_cids)
    print(f"Resolved country names for {len(wikidata_countries)} players from Wikidata.")

    # Build final player profiles mapping
    enriched_profiles = {}
    
    # Pre-populate with base profiles
    for name, p_data in base_profiles.items():
        enriched_profiles[name] = p_data

    # Add resolved profiles
    for p in all_roster_players:
        db_name = cricsheet_to_db_name[p]
        
        # Check if profile already resolved
        target_name = db_name
        if target_name in enriched_profiles:
            continue
        if p in enriched_profiles:
            enriched_profiles[target_name] = enriched_profiles[p]
            continue
            
        # Determine nationality / overseas
        cid = name_to_cid.get(p) or name_to_cid.get(db_name)
        country = wikidata_countries.get(cid) if cid else None
        
        if country:
            is_overseas = (country.strip().lower() != "india")
        else:
            # Heuristic for overseas based on initials / names
            is_overseas = True
            # Typical Indian last names / parts
            indian_parts = [
                'singh', 'patel', 'sharma', 'yadav', 'kumar', 'khan', 'mishra', 'sharma',
                'pandey', 'tiwary', 'nayak', 'nayar', 'rahane', 'kulkarni', 'tendulkar', 'chawla',
                'ashwin', 'jadeja', 'dhawan', 'raina', 'murtaza', 'chavan', 'goswami', 'mukund',
                'balaji', 'tyagi', 'saha', 'gony', 'kartik', 'badrinath', 'vijay', 'ojha', 'binny',
                'uniyal', 'anirudha', 'jakati', 'menaria', 'harbhajan', 'dhoni', 'gaikwad', 'pant',
                'iyer', 'samson', 'rahul', 'gill', 'jaiswal', 'dube', 'deshpande', 'avanish',
                'rizvi', 'porel', 'vyshak', 'dagar', 'lomror', 'patidar', 'deep', 'dayal', 'shashank',
                'ashutosh', 'sudharsan', 'kishore', 'ahmed', 'thakur', 'nitish'
            ]
            p_lower = db_name.lower()
            if any(part in p_lower for part in indian_parts):
                is_overseas = False

        # Determine stats
        bat = bat_stats.get(db_name, {"runs": 0, "matches": 0})
        bowl = bowl_stats.get(db_name, {"wickets": 0, "overs": 0})
        
        # Determine role
        runs = bat["runs"]
        wickets = bowl["wickets"]
        overs = bowl["overs"]
        
        if db_name in WICKETKEEPERS:
            role = "Wicketkeeper"
        elif wickets >= 10 and runs >= 150:
            role = "All-Rounder"
        elif wickets >= 10 and runs < 150:
            role = "Bowler"
        elif wickets < 10 and runs >= 150:
            role = "Batsman"
        elif overs > 15:
            role = "Bowler"
        else:
            # Default to stats role
            if runs > wickets * 15:
                role = "Batsman"
            elif wickets > 0:
                role = "Bowler"
            else:
                role = "Batsman"

        # Determine batting style
        batting_style = "Left-hand bat" if db_name in LEFT_HANDERS else "Right-hand bat"

        # Determine bowling style
        if role in ["Bowler", "All-Rounder"] or wickets > 0:
            if db_name in SPIN_BOWLERS:
                # Guess spin type
                bowling_style = "Slow left-arm orthodox" if db_name in LEFT_HANDERS else "Right-arm offbreak"
            else:
                bowling_style = "Right-arm medium-fast"
        else:
            bowling_style = "None"

        enriched_profiles[db_name] = {
            "role": role,
            "is_overseas": is_overseas,
            "batting_style": batting_style,
            "bowling_style": bowling_style
        }

    # Write final player profiles to data/squads/player_profiles.json
    os.makedirs(DATA_DIR, exist_ok=True)
    profiles_json_path = os.path.join(DATA_DIR, "player_profiles.json")
    with open(profiles_json_path, "w", encoding="utf-8") as f:
        json.dump(enriched_profiles, f, indent=2, ensure_ascii=False)
    print(f"Wrote {profiles_json_path}")

    # Generate the combined season_rosters.json using database names
    final_rosters = {}
    for team, seasons in raw_rosters.items():
        canon_team = team
        if team == "Royal Challengers Bengaluru":
            canon_team = "Royal Challengers Bangalore"
            
        if canon_team not in final_rosters:
            final_rosters[canon_team] = {}
            
        for season_str, players in seasons.items():
            season = int(season_str)
            db_players = sorted(list({cricsheet_to_db_name[p] for p in players}))
            
            if season in final_rosters[canon_team]:
                existing = final_rosters[canon_team][season]
                final_rosters[canon_team][season] = sorted(list(set(existing).union(db_players)))
            else:
                final_rosters[canon_team][season] = db_players

    # Save finalized rosters and metadata
    final_rosters_json_path = os.path.join(DATA_DIR, "final_season_rosters.json")
    with open(final_rosters_json_path, "w", encoding="utf-8") as f:
        json.dump({
            "source": rosters_data.get("source"),
            "rosters": final_rosters
        }, f, indent=2, ensure_ascii=False)
    print(f"Wrote {final_rosters_json_path}")

    # Print samples for user review
    print("\n" + "="*72)
    print("SPOT-CHECK SAMPLE: SEASON_ROSTERS (2008-2012) for MI and CSK")
    print("="*72)

    # Captains per season
    captains = {
        "Mumbai Indians": {
            2008: "Sachin Tendulkar", 2009: "Sachin Tendulkar", 2010: "Sachin Tendulkar", 2011: "Sachin Tendulkar",
            2012: "Harbhajan Singh"
        },
        "Chennai Super Kings": {
            2008: "MS Dhoni", 2009: "MS Dhoni", 2010: "MS Dhoni", 2011: "MS Dhoni", 2012: "MS Dhoni"
        }
    }

    for team in ["Mumbai Indians", "Chennai Super Kings"]:
        print(f"\n--- {team} ---")
        for season in range(2008, 2013):
            players = final_rosters.get(team, {}).get(season, [])
            captain = captains[team][season]
            print(f"  [{season}] {len(players)} players (Captain: {captain}):")
            # Print player details (first 10)
            for p in players[:10]:
                prof = enriched_profiles.get(p, {})
                is_cap = " (C)" if p == captain or (p == "SR Tendulkar" and captain == "Sachin Tendulkar") else ""
                print(f"    - {p}{is_cap} ({prof.get('role')}, Overseas: {prof.get('is_overseas')}, Bat: {prof.get('batting_style')}, Bowl: {prof.get('bowling_style')})")
            if len(players) > 10:
                print(f"    ... and {len(players) - 10} more players")

if __name__ == "__main__":
    main()
