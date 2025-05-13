from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Month, TimeSeriesLayer, MapLayer, CategoryDescription,Notebook

@admin.register(Month)
class MonthAdmin(admin.ModelAdmin):
    list_display = ("name", "number")
    ordering = ("number",)
    search_fields = ("name",)

@admin.register(TimeSeriesLayer)
class TimeSeriesLayerAdmin(admin.ModelAdmin):
    list_display = ("name", "month", "apilink")
    list_filter = ("month",)
    search_fields = ("name", "apilink")

@admin.register(MapLayer)
class MapLayerAdmin(admin.ModelAdmin):
    list_display = ( "name", "apilink")
    # list_filter = ("category",)
    search_fields = ("name", "apilink")

@admin.register(CategoryDescription)
class CategoryDescriptionAdmin(admin.ModelAdmin):
    list_display = ("category_name", "description")
    search_fields = ("category_name", "description")
    
    
@admin.register(Notebook)
class NotebookAdmin(admin.ModelAdmin):
    list_display = ("title", "file", "created_at")
    search_fields = ("title",)
    list_filter = ("title", "created_at")    