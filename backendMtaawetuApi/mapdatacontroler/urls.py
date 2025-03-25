from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MonthViewSet, TimeSeriesLayerViewSet, MapLayerViewSet

router = DefaultRouter()
router.register(r'months', MonthViewSet)
router.register(r'time-series', TimeSeriesLayerViewSet)
router.register(r'map-layers', MapLayerViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
