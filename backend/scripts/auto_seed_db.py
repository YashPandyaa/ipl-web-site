import os
import sys

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(script_dir)
    sys.path.append(backend_dir)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ipl_project.settings')
    import django
    django.setup()

    from ipl.models import Match
    count = Match.objects.count()
    print(f"Current match count in DB: {count}")
    if count == 0:
        print("Database is empty. Populating IPL datasets (2008-2026)...")
        gen_script = os.path.join(script_dir, 'generate_real_matches_stats_2008_2026.py')
        os.system(f"python \"{gen_script}\"")
        print(f"New match count in DB: {Match.objects.count()}")
    else:
        print("Database already contains records.")

if __name__ == '__main__':
    main()
