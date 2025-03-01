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
from dotenv import load_dotenv
from django.views.decorators.csrf import csrf_exempt
import shapely
# Create your views here.
import geopandas as gpd 
import json
import psycopg2
import geopandas as gpd
import requests
import time
import os 
import functools

load_dotenv()






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


# Cache DB connection engine to reuse it for multiple requests
@functools.cache
def get_db_engine():
    db_connection_url = os.getenv("DBURL")
    return create_engine(db_connection_url)

@functools.cache
# Query function to fetch GeoDataFrame from the database
def query(table_name):
    engine = get_db_engine()  # Use cached engine
    query = f'SELECT * FROM {table_name}'
    # Use GeoPandas to run the query and read it as a GeoDataFrame
    gdf = gpd.GeoDataFrame.from_postgis(query, con=engine, geom_col='geom')
    return gdf
def getCurrentNeighbourhood(request):
    engine = get_db_engine()  # Use cached engine
    coordinates = request.GET.get("coordinates")
    try:
        # Parse the coordinates into a list of floats
        coords = [float(coord) for coord in coordinates.split(",")]
        if len(coords) != 2:
            return JsonResponse({"error": "Invalid coordinates format, expected two values"}, status=400)
    except ValueError:
        return JsonResponse({"error": "Invalid coordinates format, ensure they are numbers"}, status=400)

    try:
        # Fetch all data
        sql_query = "SELECT name, geom FROM estates_nairobi"
        gdf = gpd.GeoDataFrame.from_postgis(sql_query, con=engine, geom_col='geom')
        # Ensure CRS is set
        gdf.to_crs("EPSG:4326", inplace=True)
        
        # Create a Point object for the given coordinates
        point = shapely.Point(coords[0], coords[1])

        # Filter GeoDataFrame by spatial containment
        filtered_gdf = gdf[gdf.contains(point)]
        print(filtered_gdf)
        if not filtered_gdf.empty:
            # Convert to GeoJSON
            geojson = filtered_gdf.to_json()
            return JsonResponse({
                "geojson": geojson,
            })
        else:
            return JsonResponse({"message": "No neighborhood found for the given coordinates."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def getAccessibility(request, table_name):
    if request.method == "GET":
        try:
            # Fetch the GeoDataFrame using the query function
            gdf = query(table_name)

            # Check and transform CRS if necessary
            if gdf.crs != 'EPSG:4326':
                gdf = gdf.to_crs('EPSG:4326')

            # Drop rows with null values in any column (including geometry)
            gdf = gdf.dropna(subset=['geom'])

            # Convert the GeoDataFrame to GeoJSON
            geojson_data = json.loads(gdf.to_json())

            # Extract geometry type (e.g., 'Point', 'Polygon')
            geom_type = gdf.geometry.geometry.type.iloc[0]

            # Return as a JsonResponse
            return JsonResponse({"geoJson": geojson_data, "geomType": geom_type}, safe=False)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)



@functools.cache
def fetch_geojson_from_geoserver(request,table_name):
    # GeoServer WFS endpoint URL
    wfs_url = "http://34.66.220.78:8080/geoserver/personal/wms"

    # Layer name (ensure this is the correct workspace and layer name)
    layer_name = f"mtaawetu:{table_name}"

    # Parameters to pass with the request
    params = {
        "service": "WFS",
        "version": "1.0.0",
        "request": "GetFeature",
        "typeName": layer_name,
        "outputFormat": "json",  # Request GeoJSON
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
        dbname=os.getenv("dbname"),
        user=os.getenv("user"),
        password=os.getenv("password"),
        host=os.getenv("host"),
        port='5432'
    )     
    
connection = get_db_connection()

# Function to clean GeoJSON geometry
def clean_geometry(geometry):
    def strip_z(coords):
        if isinstance(coords[0], list):
            return [strip_z(c) for c in coords]
        return coords[:2]

    if "coordinates" in geometry:
        geometry["coordinates"] = strip_z(geometry["coordinates"])
    return geometry

# Cache function based on table_name
@functools.cache
def get_cached_geojson(table_name):
    geojson_data = {
        "type": "FeatureCollection",
        "features": []
    }

    conn = connection
    cursor = conn.cursor()
    try:
        # Query to fetch features and simplify geometry
        sql_query = f'''
        SELECT ST_AsGeoJSON(ST_Simplify(geom, 0.01)) AS geometry
        FROM {table_name};
        '''
        cursor.execute(sql_query)
        rows = cursor.fetchall()

        for row in rows:
            geojson_data["features"].append({
                "type": "Feature",
                "geometry": clean_geometry(json.loads(row[0])),
                "properties": {}
            })

        return geojson_data
    finally:
        cursor.close()
        conn.close()


# Django view function
def getMaps(request, table_name):
    if request.method == "GET":
        try:
            # Use cached function for fetching GeoJSON data
            geojson_data = get_cached_geojson(table_name)
            return JsonResponse(geojson_data, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

import traceback

@csrf_exempt
def getMapStats(request, tablename):
    print(tablename)
    print(f"Request method: {request.method}")
    if request.method == "POST":
        print(request.body)
        try:
            # Validate table name
            if not tablename or not tablename.isidentifier():
                return JsonResponse({"error": "Invalid or missing table name"}, status=400)

            # Query to fetch numeric columns
            column_query = f"""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = '{tablename}'
                AND data_type IN ('integer', 'double precision', 'numeric', 'real')
                AND column_name NOT IN ('gid', 'id');
            """

            with connection.cursor() as cursor:
                # Fetch numeric columns
                cursor.execute(column_query)
                columns = cursor.fetchall()

                if not columns:
                    return JsonResponse({"response": "No numeric columns found"}, safe=False)

                # Prepare statistics query dynamically
                numeric_columns = [col[0] for col in columns]
                stats_parts = []
                
                # Add statistics for numeric columns
                for col in numeric_columns:
                    stats_parts.extend([
                        f"AVG({col}) AS mean_{col}",
                        f"SUM({col}) AS sum_{col}",
                        f"STDDEV({col}) AS stddev_{col}",
                        f"VARIANCE({col}) AS variance_{col}",
                        f"MIN({col}) AS min_{col}",
                        f"MAX({col}) AS max_{col}"
                    ])
                
                # Add PostGIS statistics for the geom column
                stats_parts.extend([
                    "ST_Extent(geom) AS geom_extent",  # Bounding box
                    "ST_Area(ST_Union(geom)) AS total_area"  # Total area
                ])

                # Combine all parts into the final query
                stats_query = f"SELECT {', '.join(stats_parts)} FROM {tablename};"

                # Execute the statistics query
                cursor.execute(stats_query)
                results = cursor.fetchone()

            # Map results to keys
            response_keys = stats_parts  # Using the order of the stats_parts
            response = dict(zip([key.split(' AS ')[1] for key in stats_parts], results))

            return JsonResponse({"response": response}, safe=False)

        except Exception as e:
            error_message = f"{str(e)}\n{traceback.format_exc()}"
            return JsonResponse({"error": error_message}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)



def get_wms_layer(request, layername):
    """
    Returns a WMS layer URL for the given layername in the specified format.
    """
    # Base GeoServer WMS URL
    GEOSERVER_WMS_BASE_URL = "https://mtaawetu.com/geoserver/personal/wms"
    
    # Query parameters for WMS GetCapabilities
    params = {
        "service": "WMS",
        "request": "GetCapabilities",
        "version": "1.0.0",
    }

    try:
        # Verify if the layer exists in GeoServer
        response = requests.get(GEOSERVER_WMS_BASE_URL, params=params)
        response.raise_for_status()

        if layername in response.text:
            # Construct the WMS layer URL in the desired format
            wms_layer_url = (
                f"{GEOSERVER_WMS_BASE_URL}"
                f"?bbox={{bbox-epsg-3857}}"
                f"&format=image/png"
                f"&service=WMS"
                f"&version=1.1.0"
                f"&request=GetMap"
                f"&srs=EPSG:3857"
                f"&transparent=true"
                f"&width=256"
                f"&height=256"
                f"&layers=personal:{layername}"
            )
            # Return the WMS layer URL in the required structure
            return JsonResponse({
                "success": True,
                "layer": {
                    "id": layername,
                    "name": layername,
                    "apilink": wms_layer_url,
                }
            })
        else:
            return JsonResponse({
                "success": False,
                "error": f"Layer '{layername}' not found in GeoServer."
            }, status=404)

    except requests.RequestException as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)
        


LAYER_NAME_MAPPING = {
    # NO2 Layers
    "JAN NO2": "no2_janmea",
    "FEB NO2": "no2_febmea",
    "MAR NO2": "no2_marmea",
    "APR NO2": "no2_aprmea",
    "MAY NO2": "no2_maymea",
    "JUN NO2": "no2_junmea",
    "JUL NO2": "no2_julmea",
    "AUG NO2": "no2_augmea",
    "SEP NO2": "no2_sepmea",
    "OCT NO2": "no2_octmea",
    "NOV NO2": "no2_novmea",
    "DEC NO2": "no2_decmea",

    # SO2 Layers
    "JAN SO2": "so2_janmea",
    "FEB SO2": "so2_febmea",
    "MAR SO2": "so2_marmea",
    "APR SO2": "so2_aprmea",
    "MAY SO2": "so2_maymea",
    "JUN SO2": "so2_junmea",
    "JUL SO2": "so2_julmea",
    "AUG SO2": "so2_augmea",
    "SEP SO2": "so2_sepmea",
    "OCT SO2": "so2_octmea",
    "NOV SO2": "so2_novmea",
    "DEC SO2": "so2_decmea",
}

def query_layer(request):
    engine = get_db_engine()
    layer_name = request.GET.get("layer")
    lng = request.GET.get("lng")
    lat = request.GET.get("lat")

    if not layer_name or not lng or not lat:
        return JsonResponse({"error": "Missing required parameters"}, status=400)

    # Map the user-friendly name to the actual database table name
    table_name = LAYER_NAME_MAPPING.get(layer_name)
    if not table_name:
        return JsonResponse({"error": f"Layer '{layer_name}' not found"}, status=400)

    try:
        sql_query = f"SELECT name, geom, {table_name} FROM estates_nairobi"
        gdf = gpd.GeoDataFrame.from_postgis(sql_query, con=engine, geom_col='geom')
        # Ensure CRS is set
        gdf.to_crs("EPSG:4326", inplace=True)
        
        # Create a Point object for the given coordinates
        point = shapely.Point(lng, lat)

        # Filter GeoDataFrame by spatial containment
        filtered_gdf = gdf[gdf.contains(point)]
        # print(filtered_gdf)
        if not filtered_gdf.empty:
            # Convert to GeoJSON
            geojson = filtered_gdf.to_json()
            return JsonResponse({
                "geojson": geojson,
            })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)     