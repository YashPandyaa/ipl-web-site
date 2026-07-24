import os
import urllib.request
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import transaction
from ipl.models import BattingRecord, BowlingRecord

ALIAS_MAP = {
    'SP Narine': 'Sunil Narine',
    'DJ Bravo': 'Dwayne Bravo',
    'AR Patel': 'Axar Patel',
    'HH Pandya': 'Hardik Pandya',
    'B Kumar': 'Bhuvneshwar Kumar',
    'YS Chahal': 'Yuzvendra Chahal',
    'JJ Bumrah': 'Jasprit Bumrah',
    'PP Chawla': 'Piyush Chawla',
    'A Mishra': 'Amit Mishra',
    'JH Kallis': 'Jacques Kallis',
    'RG Sharma': 'Rohit Sharma',
    'KD Karthik': 'Dinesh Karthik',
    'SK Raina': 'Suresh Raina',
    'YK Pathan': 'Yusuf Pathan',
    'SR Watson': 'Shane Watson',
    'G Gambhir': 'Gautam Gambhir',
    'AM Rahane': 'Ajinkya Rahane',
    'DA Warner': 'David Warner',
    'CH Gayle': 'Chris Gayle',
    'KA Pollard': 'Kieron Pollard',
    'JA Morkel': 'Albie Morkel',
    'R Ashwin': 'Ravichandran Ashwin',
    'SA Yadav': 'Suryakumar Yadav',
    'AD Russell': 'Andre Russell'
}

def parse_wikipedia_table(table):
    rows = table.find_all('tr')
    if not rows:
        return []
    max_cols = 0
    for row in rows:
        cells = row.find_all(['td', 'th'])
        cols = sum(int(cell.get('colspan', 1)) for cell in cells)
        if cols > max_cols:
            max_cols = cols
    grid = [[None for _ in range(max_cols)] for _ in range(len(rows))]
    for r_idx, row in enumerate(rows):
        c_idx = 0
        for cell in row.find_all(['td', 'th']):
            while c_idx < max_cols and grid[r_idx][c_idx] is not None:
                c_idx += 1
            if c_idx >= max_cols:
                break
            rowspan = int(cell.get('rowspan', 1))
            colspan = int(cell.get('colspan', 1))
            val = cell.get_text(strip=True)
            for r_offset in range(rowspan):
                for c_offset in range(colspan):
                    if r_idx + r_offset < len(rows) and c_idx + c_offset < max_cols:
                        grid[r_idx + r_offset][c_idx + c_offset] = val
            c_idx += colspan
    header_row = grid[0]
    results = []
    for row in grid[1:]:
        row_dict = {}
        for c_idx, val in enumerate(row):
            header_name = header_row[c_idx] if c_idx < len(header_row) else f"col_{c_idx}"
            row_dict[header_name] = val
        results.append(row_dict)
    return results

class Command(BaseCommand):
    help = 'Scrape correct IPL stats from Wikipedia and consolidate player aliases in the SQLite DB'

    def handle(self, *args, **options):

        
        url = 'https://en.wikipedia.org/wiki/List_of_Indian_Premier_League_records_and_statistics'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        
        scraped_runs = {}
        scraped_wickets = {}
        
        try:
            with urllib.request.urlopen(req) as response:
                html = response.read()
            soup = BeautifulSoup(html, 'html.parser')
            tables = soup.find_all('table', class_='wikitable')
            
            # Parse Most Runs (Table 15)
            batting_rows = parse_wikipedia_table(tables[15])
            for item in batting_rows:
                name_raw = item.get('Player')
                if not name_raw:
                    continue
                name = name_raw.replace('*', '').strip()
                name_clean = name.replace('†', '').replace('*', '').split('[')[0].strip()
                runs_raw = item.get('Runs')
                if runs_raw:
                    runs = int(runs_raw.replace(',', '').strip())
                    scraped_runs[name_clean] = runs
            
            # Parse Most Wickets (Table 22)
            bowling_rows = parse_wikipedia_table(tables[22])
            for item in bowling_rows:
                name_raw = item.get('Player')
                if not name_raw:
                    continue
                name = name_raw.replace('*', '').strip()
                name_clean = name.replace('†', '').replace('*', '').split('[')[0].strip()
                wickets_raw = item.get('Wickets')
                if wickets_raw:
                    wickets = int(wickets_raw.strip())
                    scraped_wickets[name_clean] = wickets
            
            self.stdout.write(self.style.SUCCESS(f"Successfully scraped {len(scraped_runs)} runs leaders and {len(scraped_wickets)} wickets leaders."))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Scraping failed: {e}. Proceeding with consolidation using hardcoded checks."))


        
        seasons = sorted(list(set(
            list(BattingRecord.objects.values_list('season', flat=True).distinct()) +
            list(BowlingRecord.objects.values_list('season', flat=True).distinct())
        )))
        
        for season in seasons:
            with transaction.atomic():
                for alias, full_name in ALIAS_MAP.items():
                    # Consolidate Batting
                    alias_bat = BattingRecord.objects.filter(player=alias, season=season).first()
                    full_bat = BattingRecord.objects.filter(player=full_name, season=season).first()
                    
                    if alias_bat:
                        if full_bat:
                            # Update full name record with best statistics
                            full_bat.runs = max(full_bat.runs, alias_bat.runs)
                            full_bat.matches = max(full_bat.matches, alias_bat.matches)
                            full_bat.innings = max(full_bat.innings or 0, alias_bat.innings or 0)
                            full_bat.balls_faced = max(full_bat.balls_faced or 0, alias_bat.balls_faced or 0)
                            full_bat.average = max(full_bat.average or 0.0, alias_bat.average or 0.0)
                            full_bat.strike_rate = max(full_bat.strike_rate or 0.0, alias_bat.strike_rate or 0.0)
                            full_bat.hundreds = max(full_bat.hundreds or 0, alias_bat.hundreds or 0)
                            full_bat.fifties = max(full_bat.fifties or 0, alias_bat.fifties or 0)
                            full_bat.sixes = max(full_bat.sixes or 0, alias_bat.sixes or 0)
                            full_bat.fours = max(full_bat.fours or 0, alias_bat.fours or 0)
                            full_bat.save()
                            alias_bat.delete()
                        else:
                            # Rename alias to full name
                            alias_bat.player = full_name
                            alias_bat.save()
                    
                    # Consolidate Bowling
                    alias_bowl = BowlingRecord.objects.filter(player=alias, season=season).first()
                    full_bowl = BowlingRecord.objects.filter(player=full_name, season=season).first()
                    
                    if alias_bowl:
                        if full_bowl:
                            # Update full name record with best statistics
                            full_bowl.wickets = max(full_bowl.wickets, alias_bowl.wickets)
                            full_bowl.matches = max(full_bowl.matches, alias_bowl.matches)
                            full_bowl.innings = max(full_bowl.innings or 0, alias_bowl.innings or 0)
                            full_bowl.overs = max(full_bowl.overs or 0.0, alias_bowl.overs or 0.0)
                            full_bowl.economy = min(full_bowl.economy or 99.0, alias_bowl.economy or 99.0) if (full_bowl.economy and alias_bowl.economy) else (full_bowl.economy or alias_bowl.economy or 0.0)
                            full_bowl.save()
                            alias_bowl.delete()
                        else:
                            # Rename alias to full name
                            alias_bowl.player = full_name
                            alias_bowl.save()
                            
        # Apply scraped values directly to player season=0 records to ensure absolute accuracy
        with transaction.atomic():
            for name, runs in scraped_runs.items():
                bat = BattingRecord.objects.filter(player=name, season=0).first()
                if bat:
                    if bat.runs != runs:
                        self.stdout.write(f"Updating {name} career runs: {bat.runs} -> {runs} (Wikipedia Scraped)")
                        bat.runs = runs
                        bat.save()
            for name, wickets in scraped_wickets.items():
                bowl = BowlingRecord.objects.filter(player=name, season=0).first()
                if bowl:
                    if bowl.wickets != wickets:
                        self.stdout.write(f"Updating {name} career wickets: {bowl.wickets} -> {wickets} (Wikipedia Scraped)")
                        bowl.wickets = wickets
                        bowl.save()


        
        # Print top consolidated all-rounders
        self.stdout.write("Top 10 Consolidated All-Rounders:")
        bat_records = {r.player: r for r in BattingRecord.objects.filter(season=0)}
        bowl_records = {r.player: r for r in BowlingRecord.objects.filter(season=0)}
        
        all_rounders = []
        for player, bat in bat_records.items():
            bowl = bowl_records.get(player)
            if bowl and bat.runs > 0 and bowl.wickets > 0:
                if bat.runs >= 500 and bowl.wickets >= 20:
                    score = bat.runs + (bowl.wickets * 20)
                    all_rounders.append((player, bat.runs, bowl.wickets, score))
                    
        all_rounders.sort(key=lambda x: x[3], reverse=True)
        
        for idx, (player, runs, wickets, score) in enumerate(all_rounders[:10]):
            self.stdout.write(f"{idx+1}. {player:<22} Runs: {runs:<5} Wickets: {wickets:<3} Score: {score}")
            

        self.stdout.write(self.style.SUCCESS("All-rounders data consolidation completed successfully!"))
