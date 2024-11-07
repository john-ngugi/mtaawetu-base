from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.response import Response 
from rest_framework.decorators import api_view
from .serializers import ProductSerializer
from rest_framework import generics
from . models import Product
from django.shortcuts import get_object_or_404
from sqlalchemy import create_engine
from io import BytesIO
from datetime import datetime
# Create your views here.
import geopandas as gpd 
import json
import psycopg2
import geopandas as gpd
import requests
import time
import os 

@api_view(["POST","GET"])
def index(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid(raise_exception=True):
        # instance=serializer.save()
        print(serializer.data)
        return Response(serializer.data)
    return Response("Invalid Data", status=400)

class ProductDetailApiView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
class prductCreateAPIView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    def perform_create(self, serializer):
        print(serializer.validated_data)
        title = serializer.validated_data.get("title")
        content = serializer.validated_data.get("content") or None
        if content is None:
            content = title
        serializer.save(content=content)
    
class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer    
    
product_detail_view =ProductDetailApiView.as_view()    
product_create_view = prductCreateAPIView.as_view()
product_list_create_view = ProductListCreateAPIView.as_view()

@api_view(["GET","POST"])
def coreProductAPI(request, pk=None):
    method = request.method
    
    if method == "GET":
        if pk is not None:
            obj = get_object_or_404(Product,pk=pk)
            data = ProductSerializer(obj,many=False).data
            return Response(data)
        
        queryset = Product.objects.all()    
        data = ProductSerializer(queryset,many=True).data
        return Response(data)
    
    if method == "POST":
        serializer = ProductSerializer(data= request.data)   
        
        if serializer.is_valid(raise_exception=True):
            title = serializer.validated_data.get("title")
            content = serializer.validated_data.get("content") or None
            if content is None:
                content = title
            serializer.save(content=content)
            return Response(serializer.data)
        return Response({"Invalid":"not good data"}, status=400)
              
        
def getAccessibility(request,table_name):
    method = request.method
    if method == "GET":
        db_connection_url = "postgresql://johngis:john0735880407@postgresql-johngis.alwaysdata.net/johngis_db1"
        # create the connection engine
        # Create SQLAlchemy engine
        engine = create_engine(db_connection_url)
        print("starting Query")
        # get the connection url from the database
        query = f'SELECT * FROM {table_name}'
        # Use GeoPandas to run the query and read it as a GeoDataFrame
        gdf = gpd.GeoDataFrame.from_postgis(query, con=engine, geom_col='geom')
        print("Finished Query")
        if gdf.crs != 'EPSG:4326':
            gdf = gdf.to_crs('EPSG:4326')
        #drop any null values
        gdf = gdf.dropna()
        print(gdf)
        # Convert GeoPandas GeoDataFrame to GeoJSON format
        geojson = gdf.to_json()
        # Load the GeoJSON string to ensure it's valid JSON without extra slashes
        geojson_data = json.loads(geojson)
        geomType = gdf.geometry.geometry.type
        print(geomType.values[0])
        # Return as a JsonResponse
        return JsonResponse({"geoJson":geojson_data,"geomType":geomType.values[0]}, safe=False)


def fetch_geojson_from_geoserver(request,table_name):
    # GeoServer WFS endpoint URL
    wfs_url = "http://44.211.211.66:8080/geoserver/mtaawetu/ows"

    # Layer name (ensure this is the correct workspace and layer name)
    layer_name = f"mtaawetu:{table_name}"

    # Parameters to pass with the request
    params = {
        "service": "WFS",
        "version": "1.0.0",
        "request": "GetFeature",
        "typeName": layer_name,
        "outputFormat": "application/json",  # Request GeoJSON
        "srsName": "EPSG:4326",
    }

    # Record the start time before sending the request
    start_time = time.time()

    try:
        # Send GET request to GeoServer WFS endpoint
        response = requests.get(wfs_url, params=params)
        response.raise_for_status()  # Raises HTTPError for bad responses (4xx or 5xx)

        # Record the end time after the response is received
        end_time = time.time()

        # Calculate the elapsed time
        elapsed_time = end_time - start_time
        print(f"Request completed in {elapsed_time:.2f} seconds")

        # Get the JSON response
        geojson_data = response.json()
        # geojson_data = json.dumps(geojson_data)
        # Log the response to check the structure
        
        # Check if 'features' is in the response and not empty
        if "features" in geojson_data and geojson_data["features"]:
            # Get the geometry type of the first feature (or iterate through all features)
            feature = geojson_data["features"][0]  # Access the first feature (you can loop through all)
            geom_type = feature["geometry"]["type"]  # This is the geometry type, e.g., 'Point', 'Polygon', etc.

            # You can save this to a variable (e.g., geomType)
            geomType = geom_type
        
        # Extract only the features array from the response to return a proper GeoJSON structure
        cleaned_geojson = {
            "type": "FeatureCollection",
            "features": geojson_data.get("features", []),  # Use empty list if no features are found
        }

        # Return the cleaned GeoJSON response along with the time it took to fetch
        return JsonResponse({"geoJson": cleaned_geojson, "time_taken": f"{elapsed_time:.2f} seconds","geomType":geomType}, safe=False)
    
    except requests.exceptions.HTTPError as e:
        # Return an error response if there is an HTTP error
        return JsonResponse({"error": f"HTTP error: {str(e)}"}, status=400)
    
    except Exception as e:
        # Catch any other exceptions and return an error response
        return JsonResponse({"error": str(e)}, status=500)

def get_db_connection():
    return psycopg2.connect(
        dbname='johngis_db1',
        user='johngis',
        password='john0735880407',
        host='postgresql-johngis.alwaysdata.net',
        port='5432'
    )     
      
def getMaps(request, table_name): 
    method = request.method 
    # create the GeoJson file structure to avoid unaccepted geoJson
    geojson_data = {
        "type": "FeatureCollection",
        "features": []
    }
    
    if method == "GET":
        conn = get_db_connection()
        cursor = conn.cursor()
        with cursor:
            # Start a transaction
            cursor.execute("BEGIN")
            # Query to fetch all features and transform the geometry to GeoJSON
            sql_query = f'SELECT ST_AsGeoJSON(ST_ForcePolygonCCW(ST_Transform(ST_SetSRID(geom,3237),3237))) AS geometry FROM {table_name};'
            cursor.execute("ROLLBACK")
            conn.commit()
            cursor.execute(sql_query)

            # Fetch all rows
            rows = cursor.fetchall()
            
            for row in rows:
                feature = {
                    "type": "Feature",
                    "geometry": json.loads(row[0]),
                    "properties": {}
                }
                geojson_data["features"].append(feature)
        return JsonResponse(geojson_data, safe=False)        
            
             