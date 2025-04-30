from rest_framework import serializers
from .models import Month, TimeSeriesLayer, MapLayer, CategoryDescription

class MonthSerializer(serializers.ModelSerializer):
    class Meta:
        model = Month
        fields = "__all__"
class CategoryDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryDescription
        fields = ['id', 'category_name', 'description']
class TimeSeriesLayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSeriesLayer
        fields = "__all__"

class MapLayerSerializer(serializers.ModelSerializer):
    category_fk = CategoryDescriptionSerializer()
    class Meta:
        model = MapLayer
        fields = "__all__"
