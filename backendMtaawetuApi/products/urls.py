from django.urls import path 
from . import views
urlpatterns = [
    path('',views.coreProductAPI,name="home"),
    path("<int:pk>/",views.product_detail_view,name="products"),
    path("all/",views.product_list_create_view,name = "list-view"),
    path('maps/<str:table_name>/',views.getAccessibility,name="getAccessibility"),
    path('maps-raw/<str:table_name>/',views.getMaps,name="getMaps"),
    path('maps-wfs/<str:table_name>/',views.fetch_geojson_from_geoserver,name="getWFS"),
    path('maps-wms/<str:layername>/',views.get_wms_layer,name="getWMS"),
    path('get-map-stats/<str:tablename>/',views.getMapStats),
    path('get-curent-neighbourhood/',views.getCurrentNeighbourhood),
]
