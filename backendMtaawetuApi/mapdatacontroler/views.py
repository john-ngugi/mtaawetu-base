from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Notebook
from .models import Month, TimeSeriesLayer, MapLayer, Notebook
from .serializers import MonthSerializer, TimeSeriesLayerSerializer, MapLayerSerializer,NotebookSerializer
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny

class MonthViewSet(viewsets.ModelViewSet):
    queryset = Month.objects.all()
    serializer_class = MonthSerializer

class TimeSeriesLayerViewSet(viewsets.ModelViewSet):
    queryset = TimeSeriesLayer.objects.all()
    serializer_class = TimeSeriesLayerSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [AllowAny]  
    
class MapLayerViewSet(viewsets.ModelViewSet):
    queryset = MapLayer.objects.all()
    serializer_class = MapLayerSerializer    
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [AllowAny]  
    
# notebooks/views.py
from rest_framework import viewsets

class NotebookViewSet(viewsets.ReadOnlyModelViewSet):  # Only GET endpoints
    queryset = Notebook.objects.all()
    serializer_class = NotebookSerializer
