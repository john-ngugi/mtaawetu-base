from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MonthViewSet, TimeSeriesLayerViewSet, MapLayerViewSet
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import NotebookViewSet


router = DefaultRouter()
router.register(r'notebooks', NotebookViewSet, basename='notebook')
router.register(r'months', MonthViewSet)
router.register(r'time-series', TimeSeriesLayerViewSet)
router.register(r'map-layers', MapLayerViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)