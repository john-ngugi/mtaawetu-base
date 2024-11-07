from django.shortcuts import render
from django.forms.models import model_to_dict
from django.http import JsonResponse
import json
from products.models import Product
from products.serializers import ProductSerializer
# Create your views here.

def index(request):
    instance = Product.objects.order_by("?").first()
    data = {}
    # data = model_to_dict(model_data)
    data = ProductSerializer(instance).data
    return JsonResponse({'data':data},safe=True)