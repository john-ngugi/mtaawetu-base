from django.db import models

class County(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Month(models.Model):
    name = models.CharField(max_length=3)  # e.g., JAN, FEB, etc.
    number = models.IntegerField(unique=True)  # 1, 2, 3, ...

    def __str__(self):
        return self.name

class TimeSeriesLayer(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)  # e.g., "NO2 Air Quality Index Timeseries 2024"
    month = models.ForeignKey(Month, on_delete=models.CASCADE)
    county = models.ForeignKey(County, on_delete=models.CASCADE, null=True, blank=True)  # Add county dropdown
    apilink = models.URLField()
    legend_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.county})"
    
    
    class Meta:
        ordering = ['month']  # Order by month in ascending order

class MapLayer(models.Model):
    category = models.CharField(max_length=100)  # e.g., "Accessibility", "Indices"
    name = models.CharField(max_length=100)  # e.g., "estates_nairobi"
    county = models.ForeignKey(County, on_delete=models.CASCADE, null=True, blank=True)  # Add county dropdown
    apilink = models.URLField()
    legend_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.county})"
