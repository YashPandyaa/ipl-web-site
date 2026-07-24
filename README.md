<div align="center">

# 🏏 IPL Stats Universe

### Enterprise-Grade Cricket Analytics Platform · 2008–2026

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django)](https://djangoproject.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-FFD43B?style=for-the-badge&logo=python)](https://python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org/)
[![Chart.js](https://img.shields.io/badge/Chart.js-Analytics-FF6384?style=for-the-badge&logo=chart.js)](https://chartjs.org/)

> 19 Seasons · 1000+ Matches · 2000+ Players · 9 Modules · 1 Platform

[🚀 Live Demo](#) · [📖 Documentation](#documentation) · [🐛 Report Bug](https://github.com/YashPandyaa/ipl-web-site/issues) · [✨ Request Feature](https://github.com/YashPandyaa/ipl-web-site/issues)

</div>

---

## 📸 Preview

| Home Dashboard | Player Hub | Venue Map |
|---|---|---|
| Real-time counters & AI commentary | 2000+ player search & career stats | GIS interactive India stadium map |

---

## ✨ What is IPL Stats Universe?

**IPL Stats Universe** is a full-stack, enterprise-grade cricket data analytics platform covering **19 complete IPL seasons (2008–2026)**. Built with modern technologies, it features interactive charts, AI-generated match reports, real-time head-to-head engines, GIS venue maps, animated leaderboards, and historical records — all in one platform.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router) + React 18 + TypeScript |
| **Styling** | Custom CSS Design System (Day Turf & Stadium Floodlight themes) |
| **Charts** | Chart.js — Radar, Line, Bar, Animated Bar Chart Race |
| **Maps** | Leaflet.js — Interactive GIS India Stadium Maps |
| **State Management** | TanStack Query (React Query) + React Context |
| **Icons** | Lucide React + Tabler Webfont Icons |
| **Backend** | Django 5 + Django REST Framework (DRF) |
| **Database** | SQLite — Pre-populated CricSheet ball-by-ball data |
| **Runtime** | Python 3.11 virtual environment |

---

## 🎯 9 Core Modules

### 🏠 1. Home / Hero Workspace (`/`)
- Real-time IPL statistical counters (total runs, wickets, matches, 19 seasons)
- AI Match Commentary & Report Generator drawer
- Navigation hub for all 9 modules

### 📊 2. Seasonal Analytics Dashboard (`/stats`)
- Orange Cap & Purple Cap trendlines across all seasons
- Total matches per season bar charts
- Interactive Stadium performance metrics table

### 👤 3. Player Hub & Leaderboards (`/players`)
- Search autocomplete across 2,000+ IPL players
- Career timeline cards with batting/bowling stats per season
- Sliding Profile Drawer with AI Player Bio Generator

### ⚔️ 4. Team Head-to-Head & Franchise Hub (`/teams`)
- Win/Loss proportion bars between any two franchises
- Head-to-head matchup calculator (MI, CSK, RCB, KKR, etc.)
- All-time franchise win percentage leaderboards

### 👥 5. Franchise Squad Rosters (`/squads`)
- Complete 19-season squad roster viewer for all IPL teams
- Season-by-season player tracking from 2008 to 2026

### 📅 6. Season Archives & Bar Chart Race (`/seasons`)
- Year-by-year points table, champion & runner-up summary cards
- Animated Bar Chart Race — live leaderboard shifts year over year

### 🏆 7. Hall of Records (`/records`)
- Historic leaderboards: Most Runs, Wickets, Sixes, Best Economy
- Fastest Centuries & Fastest Fifties records
- One-click CSV Data Export

### 🎯 8. Superstar Player Comparator (`/compare`)
- Side-by-side radar skill index overlay
- Situational stats: Powerplay avg, Death SR, vs Spin
- AI Tactical Verdict Generator
- Day Match (Light) & Night Stadium (Dark) themes

### 🗺️ 9. Trending Venues GIS Map (`/trending`)
- Leaflet map rendering all major IPL venues across India
- Match density heat maps & venue activity indicators

---

## 📁 Project Structure

```
d:/IPL/
├── start.bat                        # Full-Stack Launcher
├── ipl.bat                          # Command alias wrapper
│
├── frontend/                        # Next.js 14 Application
│   ├── app/                         # App Router (pages & API routes)
│   │   ├── page.tsx                 # Home / Hero Workspace
│   │   ├── stats/page.tsx           # Seasonal Analytics
│   │   ├── players/page.tsx         # Player Hub
│   │   ├── teams/page.tsx           # Team H2H
│   │   ├── squads/page.tsx          # Squad Rosters
│   │   ├── seasons/page.tsx         # Season Archives
│   │   ├── records/page.tsx         # Hall of Records
│   │   ├── compare/page.tsx         # Player Comparator
│   │   └── trending/page.tsx        # Venues GIS Map
│   ├── components/                  # Reusable UI Components
│   ├── context/                     # React Context Providers
│   ├── lib/                         # API clients, utils, types
│   ├── public/                      # Static assets
│   │   ├── player_comparator.html   # Standalone H2H Tool
│   │   ├── trending_venues_map.html # Standalone GIS Map
│   │   └── india_map_blueprint.png
│   └── package.json
│
├── backend/                         # Django 5 REST Backend
│   ├── ipl_project/                 # Django settings & root URLs
│   ├── ipl/                         # Models, serializers, views
│   ├── scripts/                     # Data extraction & generator scripts
│   │   ├── generate_real_matches_stats_2008_2026.py
│   │   ├── generate_ipl_data_2023_2026.py
│   │   ├── extract_cricsheet_data.py
│   │   ├── normalize_players.py
│   │   ├── convert_dataset.py
│   │   ├── import_squad_rosters_from_cricsheet.py
│   │   └── prepare_squads_data.py
│   ├── data/                        # Backend CSV datasets & CricSheet JSONs
│   ├── db.sqlite3                   # Django SQLite Database
│   ├── manage.py
│   └── requirements.txt
│
├── data/                            # Project Data Repository
│   ├── raw/                         # Raw CricSheet zips & initial datasets
│   └── processed/                   # Aggregated master CSV files
│
├── docs/                            # Documentation & Plans
│   ├── ipl_mega_website_plan.html
│   ├── ipl_extra_features.html
│   └── html_prototypes/
│
└── archive/                         # Archived legacy sub-projects
    └── ipl-team-diagnostics/
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YashPandyaa/ipl-web-site.git
cd ipl-web-site
```

### 2. Backend Setup (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### 4. One-Click Launch (Windows)
```cmd
ipl web-site
```
> Automatically frees ports 3000 & 8000, starts both servers, and opens Chrome.

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| **Frontend** | Vercel |
| **Backend** | Railway / Render |
| **Database** | SQLite (embedded) |

---

## 📊 Data Coverage

| Metric | Value |
|---|---|
| Seasons Covered | 2008 – 2026 (19 seasons) |
| Total Matches | 1000+ |
| Total Players | 2000+ |
| Data Source | CricSheet (ball-by-ball) |
| Database | SQLite (pre-populated) |

---

## 🤖 AI Features

- **AI Match Commentary Generator** — Auto-generated match reports
- **AI Player Bio Generator** — Dynamic career summaries
- **AI Tactical Verdict** — Head-to-head player comparison analysis

---

## 🎨 Themes

| Theme | Description |
|---|---|
| ☀️ Day Turf Light | Clean, bright match-day experience |
| 🌙 Stadium Floodlight Dark | Immersive night match atmosphere |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yash Pandya**

[![GitHub](https://img.shields.io/badge/GitHub-YashPandyaa-181717?style=for-the-badge&logo=github)](https://github.com/YashPandyaa)

---

<div align="center">

**⭐ Star this repo if you found it useful!**

Made with ❤️ and 🏏 by Yash Pandya

</div>
