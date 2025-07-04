from rest_framework import serializers
from .models import Month, TimeSeriesLayer, MapLayer, CategoryDescription, Notebook
import nbformat
from nbconvert import HTMLExporter
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




class NotebookSerializer(serializers.ModelSerializer):
    notebook_html = serializers.SerializerMethodField()
    notebook_json = serializers.SerializerMethodField()  # ← add this

    class Meta:
        model = Notebook
        fields = ['id', 'title', 'file', 'created_at', 'notebook_html', 'notebook_json']

    def get_notebook_html(self, obj):
        try:
            with open(obj.file.path, encoding='utf-8') as f:
                nb = nbformat.read(f, as_version=4)
        except UnicodeDecodeError:
            with open(obj.file.path, encoding='latin-1') as f:
                nb = nbformat.read(f, as_version=4)

        from nbconvert import HTMLExporter
        html_exporter = HTMLExporter()
        body, _ = html_exporter.from_notebook_node(nb)
        return body

    def get_notebook_json(self, obj):
        try:
            with open(obj.file.path, encoding='utf-8') as f:
                nb = nbformat.read(f, as_version=4)
        except UnicodeDecodeError:
            with open(obj.file.path, encoding='latin-1') as f:
                nb = nbformat.read(f, as_version=4)

        return nb  # ← will be serialized as a nested JSON dict
    
    
    
    