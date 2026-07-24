from django.db import models

class Match(models.Model):
    match_id = models.IntegerField(unique=True)
    season = models.IntegerField()
    city = models.CharField(max_length=100, blank=True)
    date = models.DateField()
    team1 = models.CharField(max_length=100)
    team2 = models.CharField(max_length=100)
    toss_winner = models.CharField(max_length=100)
    toss_decision = models.CharField(max_length=20)
    winner = models.CharField(max_length=100, blank=True)
    win_by_runs = models.IntegerField(default=0)
    win_by_wickets = models.IntegerField(default=0)
    venue = models.CharField(max_length=200)
    player_of_match = models.CharField(max_length=100, blank=True)
    youtube_url = models.URLField(max_length=500, blank=True, null=True)
    video_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Match {self.match_id}: {self.team1} vs {self.team2} ({self.season})"

class BattingRecord(models.Model):
    player = models.CharField(max_length=100, db_index=True)
    season = models.IntegerField(db_index=True)        # 0 = all-time combined
    matches = models.IntegerField(default=0)
    innings = models.IntegerField(default=0)
    runs = models.IntegerField(default=0)
    balls_faced = models.IntegerField(default=0)
    highest_score = models.CharField(max_length=10, blank=True)
    average = models.FloatField(default=0.0)
    strike_rate = models.FloatField(default=0.0)
    hundreds = models.IntegerField(default=0)
    fifties = models.IntegerField(default=0)
    fours = models.IntegerField(default=0)
    sixes = models.IntegerField(default=0)
    dot_balls = models.IntegerField(default=0)
    not_outs = models.IntegerField(default=0)

    class Meta:
        unique_together = ('player', 'season')

    def __str__(self):
        return f"{self.player} Batting - Season {self.season}"

class BowlingRecord(models.Model):
    player = models.CharField(max_length=100, db_index=True)
    season = models.IntegerField(db_index=True)        # 0 = all-time combined
    matches = models.IntegerField(default=0)
    innings = models.IntegerField(default=0)
    overs = models.FloatField(default=0.0)
    runs_conceded = models.IntegerField(default=0)
    wickets = models.IntegerField(default=0)
    economy = models.FloatField(default=0.0)
    strike_rate = models.FloatField(default=0.0)
    best_bowling = models.CharField(max_length=10, blank=True)
    four_wickets = models.IntegerField(default=0)
    five_wickets = models.IntegerField(default=0)

    class Meta:
        unique_together = ('player', 'season')

    def __str__(self):
        return f"{self.player} Bowling - Season {self.season}"

class MilestoneRecord(models.Model):
    """Fastest centuries, fastest fifties."""
    RECORD_TYPES = [('century', 'Century'), ('fifty', 'Fifty')]
    player = models.CharField(max_length=100)
    season = models.IntegerField()
    balls = models.IntegerField()
    runs = models.IntegerField()
    against = models.CharField(max_length=100, blank=True)
    venue = models.CharField(max_length=200, blank=True)
    record_type = models.CharField(max_length=10, choices=RECORD_TYPES)

    def __str__(self):
        return f"{self.player} {self.record_type} in {self.balls} balls ({self.season})"
