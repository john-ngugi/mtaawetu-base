from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Month, TimeSeriesLayer, MapLayer

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
    list_display = ("category", "name", "apilink")
    list_filter = ("category",)
    search_fields = ("name", "apilink")
