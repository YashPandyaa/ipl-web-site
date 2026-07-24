import csv
import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(script_dir, "..", ".."))

csv_path = os.path.join(root_dir, "data", "raw", "datasets_archive", "ipl_dataset", "ipl-matches.csv")
output_dir = os.path.join(root_dir, "archive", "ipl-team-diagnostics", "src", "data")
os.makedirs(output_dir, exist_ok=True)
json_path = os.path.join(output_dir, "matches.json")

def normalize_team(team):
    if not team:
        return team
    team = team.strip()
    if team == "Rising Pune Supergiants":
        return "Rising Pune Supergiant"
    return team

matches = []
with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        margin_raw = row.get("Margin")
        margin = None
        if margin_raw and margin_raw != "NA" and margin_raw != "":
            try:
                margin = int(float(margin_raw))
            except ValueError:
                margin = margin_raw
        
        match_data = {
            "match_id": row.get("ID"),
            "date": row.get("Date"),
            "season": row.get("Season"),
            "team1": normalize_team(row.get("Team1")),
            "team2": normalize_team(row.get("Team2")),
            "toss_winner": normalize_team(row.get("TossWinner")),
            "toss_decision": row.get("TossDecision"),
            "winner": normalize_team(row.get("WinningTeam")) if row.get("WinningTeam") and row.get("WinningTeam") != "NA" else None,
            "venue": row.get("Venue"),
            "result_margin": margin,
            "won_by": row.get("WonBy")
        }
        matches.append(match_data)

def parse_date(date_str):
    if not date_str:
        return ""
    parts = date_str.split("-")
    if len(parts) == 3:
        if len(parts[2]) == 4: # DD-MM-YYYY
            return f"{parts[2]}-{parts[1]}-{parts[0]}"
        elif len(parts[0]) == 4: # YYYY-MM-DD
            return date_str
    return date_str

matches.sort(key=lambda x: parse_date(x["date"]))

with open(json_path, mode='w', encoding='utf-8') as f:
    json.dump(matches, f, indent=2)

print(f"Successfully converted {len(matches)} matches to JSON.")
