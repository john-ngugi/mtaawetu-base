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
class CategoryDescription(models.Model):
    category_name = models.CharField(max_length=100, unique=True,blank=True,)
    description = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.category_name}: {self.description}"

class TimeSeriesLayer(models.Model):
    category_fk = models.ForeignKey(CategoryDescription, on_delete=models.CASCADE, null=True)
    # category = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=100)
    month = models.ForeignKey(Month, on_delete=models.CASCADE)
    county = models.ForeignKey(County, on_delete=models.CASCADE, null=True, blank=True)
    apilink = models.URLField()
    legend_url = models.URLField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.county})"
    
    
    class Meta:
        ordering = ['month']  # Order by month in ascending order
class MapLayer(models.Model):
    category_fk = models.ForeignKey(CategoryDescription, on_delete=models.CASCADE,null=True)
    # category = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=100)
    county = models.ForeignKey(County, on_delete=models.CASCADE, null=True, blank=True)
    apilink = models.URLField()
    legend_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.county})"
