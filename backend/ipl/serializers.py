from rest_framework import serializers
from ipl.models import Match, BattingRecord, BowlingRecord, MilestoneRecord

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

class BattingRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BattingRecord
        fields = '__all__'

class BowlingRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BowlingRecord
        fields = '__all__'

class MilestoneRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MilestoneRecord
        fields = '__all__'
