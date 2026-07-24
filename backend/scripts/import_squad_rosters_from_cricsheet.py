#!/usr/bin/env python3
"""
One-time import: build per-team, per-season IPL squad rosters from Cricsheet.

Downloads ipl_json.zip (falls back to ipl_csv2.zip or local comprehensive CSV),
parses every match's registered playing XI / squad list, and aggregates unique
players per (team, season).

Player names are kept exactly as Cricsheet spells them (e.g. "V Kohli", "MS Dhoni")
so they align with BattingRecord / BowlingRecord in the SQLite DB.

Usage:
    python scripts/import_squad_rosters_from_cricsheet.py
    python scripts/import_squad_rosters_from_cricsheet.py --sample MI CSK --from 2008 --to 2012
    python scripts/import_squad_rosters_from_cricsheet.py --no-download
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import zipfile
from collections import defaultdict
from typing import DefaultDict, Dict, Iterable, List, Optional, Set, Tuple

import requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(BACKEND_DIR, "data", "cricsheet")
OUTPUT_DIR = os.path.join(BACKEND_DIR, "data", "squads")

JSON_ZIP_URL = "https://cricsheet.org/downloads/ipl_json.zip"
CSV_ZIP_URL = "https://cricsheet.org/downloads/ipl_csv2.zip"
JSON_ZIP_PATH = os.path.join(DATA_DIR, "ipl_json.zip")
CSV_ZIP_PATH = os.path.join(DATA_DIR, "ipl_csv2.zip")
COMPREHENSIVE_CSV = os.path.join(
    BACKEND_DIR, "..", "datasets", "2028-20266Dataset", "ipl_comprehensive_dataset.csv"
)

TEAM_CANONICAL: Dict[str, str] = {
    "Mumbai Indians": "Mumbai Indians",
    "Chennai Super Kings": "Chennai Super Kings",
    "Royal Challengers Bangalore": "Royal Challengers Bangalore",
    "Royal Challengers Bengaluru": "Royal Challengers Bengaluru",
    "Kolkata Knight Riders": "Kolkata Knight Riders",
    "Delhi Daredevils": "Delhi Capitals",
    "Delhi Capitals": "Delhi Capitals",
    "Rajasthan Royals": "Rajasthan Royals",
    "Deccan Chargers": "Sunrisers Hyderabad",
    "Sunrisers Hyderabad": "Sunrisers Hyderabad",
    "Kings XI Punjab": "Punjab Kings",
    "Punjab Kings": "Punjab Kings",
    "Pune Warriors": "Pune Warriors",
    "Gujarat Lions": "Gujarat Lions",
    "Rising Pune Supergiant": "Rising Pune Supergiant",
    "Rising Pune Supergiants": "Rising Pune Supergiant",
    "Kochi Tuskers Kerala": "Kochi Tuskers Kerala",
    "Gujarat Titans": "Gujarat Titans",
    "Lucknow Super Giants": "Lucknow Super Giants",
}

SAMPLE_CODE_TO_TEAM = {
    "MI": "Mumbai Indians",
    "CSK": "Chennai Super Kings",
    "RCB": "Royal Challengers Bangalore",
    "KKR": "Kolkata Knight Riders",
    "DC": "Delhi Capitals",
    "RR": "Rajasthan Royals",
    "SRH": "Sunrisers Hyderabad",
    "PBKS": "Punjab Kings",
    "GT": "Gujarat Titans",
    "LSG": "Lucknow Super Giants",
}

SeasonRosters = Dict[str, Dict[int, List[str]]]


def ensure_dirs() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def download_file(url: str, dest: str) -> bool:
    print(f"Downloading {url} ...")
    try:
        resp = requests.get(url, timeout=180)
        resp.raise_for_status()
        with open(dest, "wb") as fh:
            fh.write(resp.content)
        print(f"  Saved {dest} ({len(resp.content):,} bytes)")
        return True
    except Exception as exc:
        print(f"  Download failed: {exc}")
        return False


def season_to_year(season_val, date_val=None) -> Optional[int]:
    if season_val is not None:
        text = str(season_val).strip()
        slash = re.match(r"^(\d{4})/(\d{2})$", text)
        if slash:
            return int(slash.group(1)) + 1
        m = re.search(r"\b(20\d{2})\b", text)
        if m:
            return int(m.group(1))
    if date_val:
        m = re.search(r"\b(20\d{2})\b", str(date_val).strip())
        if m:
            return int(m.group(1))
    return None


def canonical_team(cricsheet_name: str) -> str:
    return TEAM_CANONICAL.get(cricsheet_name.strip(), cricsheet_name.strip())


def add_players(
    rosters: DefaultDict[str, DefaultDict[int, Set[str]]],
    team: str,
    season: int,
    players: Iterable[str],
) -> None:
    canon = canonical_team(team)
    for player in players:
        name = player.strip()
        if name:
            rosters[canon][season].add(name)


def parse_json_zip(zip_path: str) -> SeasonRosters:
    rosters: DefaultDict[str, DefaultDict[int, Set[str]]] = defaultdict(
        lambda: defaultdict(set)
    )
    match_count = 0

    with zipfile.ZipFile(zip_path, "r") as zf:
        json_files = [n for n in zf.namelist() if n.endswith(".json")]
        print(f"Parsing {len(json_files)} JSON match files from {zip_path}")

        for fname in json_files:
            try:
                payload = json.loads(zf.read(fname).decode("utf-8"))
            except (json.JSONDecodeError, UnicodeDecodeError):
                continue

            info = payload.get("info") or {}
            season = season_to_year(
                info.get("season"),
                (info.get("dates") or [None])[0],
            )
            if season is None:
                continue

            players_by_team = info.get("players") or {}
            if not players_by_team:
                continue

            match_count += 1
            for team, players in players_by_team.items():
                add_players(rosters, team, season, players)

    print(f"  Processed {match_count} matches with squad lists")
    return _finalize_rosters(rosters)


def parse_csv_zip(zip_path: str) -> SeasonRosters:
    rosters: DefaultDict[str, DefaultDict[int, Set[str]]] = defaultdict(
        lambda: defaultdict(set)
    )
    match_count = 0

    with zipfile.ZipFile(zip_path, "r") as zf:
        info_files = [n for n in zf.namelist() if n.endswith("_info.csv")]
        print(f"Parsing {len(info_files)} CSV info files from {zip_path}")

        for fname in info_files:
            try:
                lines = zf.read(fname).decode("utf-8").splitlines()
            except UnicodeDecodeError:
                continue

            season_raw = None
            date_raw = None
            players_for_match: List[Tuple[str, str]] = []

            for line in lines:
                row = next(csv.reader([line]))
                if len(row) < 2 or row[0] != "info":
                    continue
                key = row[1].strip()
                if key == "season" and len(row) >= 3:
                    season_raw = row[2].strip()
                elif key == "date" and len(row) >= 3 and not date_raw:
                    date_raw = row[2].strip()
                elif key == "player" and len(row) >= 4:
                    players_for_match.append((row[2].strip(), row[3].strip()))

            season = season_to_year(season_raw, date_raw)
            if season is None or not players_for_match:
                continue

            match_count += 1
            for team, player in players_for_match:
                add_players(rosters, team, season, [player])

    print(f"  Processed {match_count} matches with squad lists")
    return _finalize_rosters(rosters)


def parse_comprehensive_csv(csv_path: str) -> SeasonRosters:
    rosters: DefaultDict[str, DefaultDict[int, Set[str]]] = defaultdict(
        lambda: defaultdict(set)
    )
    match_count = 0

    print(f"Parsing comprehensive CSV: {csv_path}")
    with open(csv_path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            season = season_to_year(row.get("season"), row.get("date"))
            if season is None:
                continue

            t1 = (row.get("team1") or "").strip()
            t2 = (row.get("team2") or "").strip()
            p1 = [p.strip() for p in (row.get("team1_players") or "").split(",") if p.strip()]
            p2 = [p.strip() for p in (row.get("team2_players") or "").split(",") if p.strip()]
            if not t1 or not t2:
                continue

            match_count += 1
            add_players(rosters, t1, season, p1)
            add_players(rosters, t2, season, p2)

    print(f"  Processed {match_count} matches with squad lists")
    return _finalize_rosters(rosters)


def _finalize_rosters(
    rosters: DefaultDict[str, DefaultDict[int, Set[str]]],
) -> SeasonRosters:
    return {
        team: {season: sorted(players) for season, players in sorted(seasons.items())}
        for team, seasons in sorted(rosters.items())
    }


def load_cricsheet_rosters(download: bool = True) -> Tuple[SeasonRosters, str]:
    ensure_dirs()

    if download:
        if not os.path.exists(JSON_ZIP_PATH):
            download_file(JSON_ZIP_URL, JSON_ZIP_PATH)
        if not os.path.exists(CSV_ZIP_PATH):
            download_file(CSV_ZIP_URL, CSV_ZIP_PATH)

    if os.path.exists(JSON_ZIP_PATH):
        try:
            return parse_json_zip(JSON_ZIP_PATH), "ipl_json.zip"
        except zipfile.BadZipFile as exc:
            print(f"Bad JSON zip: {exc}")

    if os.path.exists(CSV_ZIP_PATH):
        try:
            return parse_csv_zip(CSV_ZIP_PATH), "ipl_csv2.zip"
        except zipfile.BadZipFile as exc:
            print(f"Bad CSV zip: {exc}")

    comp = os.path.normpath(COMPREHENSIVE_CSV)
    if os.path.exists(comp):
        return parse_comprehensive_csv(comp), "ipl_comprehensive_dataset.csv"

    raise FileNotFoundError(
        "No Cricsheet data found. Run without --no-download or place ipl_json.zip "
        f"in {DATA_DIR}"
    )


def save_outputs(rosters: SeasonRosters, source: str) -> None:
    out_json = os.path.join(OUTPUT_DIR, "season_rosters.json")
    meta = {
        "source": source,
        "teams": len(rosters),
        "season_range": _global_season_range(rosters),
        "rosters": rosters,
    }
    with open(out_json, "w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)
    print(f"Wrote {out_json}")


def _global_season_range(rosters: SeasonRosters) -> List[int]:
    seasons: Set[int] = set()
    for team_seasons in rosters.values():
        seasons.update(team_seasons.keys())
    return sorted(seasons)


def print_sample(
    rosters: SeasonRosters,
    team_codes: List[str],
    year_from: int,
    year_to: int,
) -> None:
    print("\n" + "=" * 72)
    print("SAMPLE SEASON_ROSTERS (Cricsheet player names, sorted A-Z)")
    print("=" * 72)

    for code in team_codes:
        team_name = SAMPLE_CODE_TO_TEAM.get(code.upper())
        if not team_name:
            print(f"\nUnknown team code: {code}")
            continue

        team_rosters = rosters.get(team_name, {})
        print(f"\n--- {team_name} ({code}) ---")

        for season in range(year_from, year_to + 1):
            players = team_rosters.get(season, [])
            print(f"\n  [{season}] {len(players)} players:")
            for p in players:
                print(f"    - {p}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--no-download", action="store_true")
    parser.add_argument("--sample", nargs="+", default=["MI", "CSK"], metavar="CODE")
    parser.add_argument("--from", dest="year_from", type=int, default=2008)
    parser.add_argument("--to", dest="year_to", type=int, default=2012)
    args = parser.parse_args()

    rosters, source = load_cricsheet_rosters(download=not args.no_download)
    save_outputs(rosters, source)

    print(f"\nSource: {source}")
    print(f"Teams: {len(rosters)}")
    print(f"Seasons: {_global_season_range(rosters)}")
    print_sample(rosters, args.sample, args.year_from, args.year_to)

    return 0


if __name__ == "__main__":
    sys.exit(main())
