from rest_framework import serializers
from .models import Month, TimeSeriesLayer, MapLayer

class MonthSerializer(serializers.ModelSerializer):
    class Meta:
        model = Month
        fields = "__all__"

class TimeSeriesLayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSeriesLayer
        fields = "__all__"

class MapLayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapLayer
        fields = "__all__"
