# 🏏 IPL Stats Universe (2008–2026)

A full-stack, enterprise-grade IPL Cricket Data Analytics Platform built with **Next.js 14** and **Django 5 REST Framework**. Features interactive statistical analytics, real-time head-to-head match-up engines, AI match reports, Leaflet GIS venue maps, and historical leaderboards spanning 19 seasons of IPL data.

---

## ✨ Features

- 🏆 **Seasonal Analytics Dashboard**: Track Orange Cap, Purple Cap, and matches played trendlines across 19 seasons.
- ⚡ **Bar Chart Race Simulator**: Animated year-by-year points table and leaderboard shifts.
- 🥊 **Franchise Head-to-Head Calculator**: Compare win percentages, tie histories, and head-to-head match stats between any two franchises.
- 🛡️ **Squad Rosters (2008–2026)**: Complete 19-season squad rosters for all active and legacy IPL teams.
- 📊 **Superstar Player Comparator**: Radar skill overlays (Strike Rate, Avg, Boundaries, Consistency, 100s, 50s) and situational statistics.
- 📍 **Trending Venues GIS Map**: Leaflet.js interactive stadium map displaying venue match density and weekly activity.
- 🤖 **AI Match & Player Insights**: AI commentary, match reports, and player bio generators.
- 📜 **Hall of Records**: Historic leaderboards for Most Runs, Most Wickets, Most Sixes, Best Economy, Fastest Centuries, and Fastest Fifties with one-click CSV export.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Chart.js, Leaflet.js, Lucide Icons, TanStack Query.
- **Backend**: Django 5, Django REST Framework (DRF), SQLite database, Python 3.11, Gunicorn.
- **Tools**: Embedded standalone HTML widgets (`player_comparator.html`, `trending_venues_map.html`).

---

## 🚀 Quick Start

### 1. One-Click Full-Stack Launcher

Run the automated launcher from the project root:

```cmd
ipl web-site
```
*or*
```cmd
.\start.bat
```

This will automatically:
1. Free up Port `3000` (Frontend) and Port `8000` (Backend).
2. Boot up the Django Backend on `http://127.0.0.1:8000`.
3. Boot up the Next.js Frontend on `http://localhost:3000`.
4. Open Google Chrome directly to `http://localhost:3000`.

---

## 📁 Repository Structure

```
d:/IPL/
├── start.bat                   # Full-stack automated launcher
├── ipl.bat                     # Command alias wrapper
│
├── frontend/                   # Next.js 14 Application
│   ├── app/                    # Next.js App Router
│   ├── components/             # UI Components
│   ├── lib/                    # API services & utilities
│   └── public/                 # Embedded HTML widgets & assets
│
├── backend/                    # Django 5 REST Framework Backend
│   ├── ipl_project/            # Django settings & URL configuration
│   ├── ipl/                    # Models, views, serializers & APIs
│   ├── scripts/                # Data extraction & generator pipeline
│   ├── data/                   # Processed cricket datasets
│   └── manage.py
│
├── data/                       # Raw & processed data archives
├── docs/                       # Project documentation & plans
└── archive/                    # Archived sub-projects
```

---

## 📜 License

MIT License © 2026 IPL Stats Universe.
