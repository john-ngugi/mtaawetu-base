from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Month, TimeSeriesLayer, MapLayer
from .serializers import MonthSerializer, TimeSeriesLayerSerializer, MapLayerSerializer

class MonthViewSet(viewsets.ModelViewSet):
    queryset = Month.objects.all()
    serializer_class = MonthSerializer

class TimeSeriesLayerViewSet(viewsets.ModelViewSet):
    queryset = TimeSeriesLayer.objects.all()
    serializer_class = TimeSeriesLayerSerializer

class MapLayerViewSet(viewsets.ModelViewSet):
    queryset = MapLayer.objects.all()
    serializer_class = MapLayerSerializer
