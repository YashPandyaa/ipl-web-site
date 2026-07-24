from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ipl.views import (
    MatchViewSet, BattingRecordViewSet, BowlingRecordViewSet,
    get_players, get_teams, get_seasons, get_venues, get_head_to_head, get_squads,
    get_record_most_runs, get_record_most_wickets, get_record_fastest_centuries,
    get_record_fastest_fifties, get_record_most_sixes, get_record_best_economy,
    get_record_all_rounders,
    ai_commentary, ai_match_report, ai_player_bio, get_quiz_players,
    get_stats_orange_cap, get_stats_purple_cap, get_stats_matches_per_season,
    get_stadiums, get_live_current_match
)

router = DefaultRouter()
router.register(r'matches', MatchViewSet, basename='matches')
router.register(r'batting', BattingRecordViewSet, basename='batting')
router.register(r'bowling', BowlingRecordViewSet, basename='bowling')

urlpatterns = [
    path('', include(router.urls)),
    
    # Custom aggregations & metadata
    path('players/', get_players, name='get_players'),
    path('players/quiz/', get_quiz_players, name='get_quiz_players'),
    path('teams/', get_teams, name='get_teams'),
    path('seasons/', get_seasons, name='get_seasons'),
    path('venues/', get_venues, name='get_venues'),
    path('head-to-head/', get_head_to_head, name='get_head_to_head'),
    path('squads/', get_squads, name='get_squads'),
    
    # New real-time metrics
    path('stats/orange-cap/', get_stats_orange_cap, name='get_stats_orange_cap'),
    path('stats/purple-cap/', get_stats_purple_cap, name='get_stats_purple_cap'),
    path('stats/matches-per-season/', get_stats_matches_per_season, name='get_stats_matches_per_season'),
    path('stadiums/', get_stadiums, name='get_stadiums'),
    path('live/current-match/', get_live_current_match, name='get_live_current_match'),
    
    # Hall of Records leaderboards
    path('records/most-runs/', get_record_most_runs, name='record_most_runs'),
    path('records/most-wickets/', get_record_most_wickets, name='record_most_wickets'),
    path('records/all-rounders/', get_record_all_rounders, name='record_all_rounders'),
    path('records/fastest-centuries/', get_record_fastest_centuries, name='record_fastest_centuries'),
    path('records/fastest-fifties/', get_record_fastest_fifties, name='record_fastest_fifties'),
    path('records/most-sixes/', get_record_most_sixes, name='record_most_sixes'),
    path('records/best-economy/', get_record_best_economy, name='record_best_economy'),
    
    # AI Endpoints
    path('ai/commentary/', ai_commentary, name='ai_commentary'),
    path('ai/match-report/<int:match_id>/', ai_match_report, name='ai_match_report'),
    path('ai/player-bio/<str:player_name>/', ai_player_bio, name='ai_player_bio'),
]
