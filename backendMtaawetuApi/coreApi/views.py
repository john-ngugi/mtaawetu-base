from django.shortcuts import render
from django.forms.models import model_to_dict
from django.http import JsonResponse
import json
from products.models import Product
from products.serializers import ProductSerializer
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import render
from .models import CustomUser, Package, Payment
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileSerializer,
    PackageSerializer,
    PaymentSerializer
)
import uuid


# Create your views here.

def index(request):
    instance = Product.objects.order_by("?").first()
    data = {}
    # data = model_to_dict(model_data)
    data = ProductSerializer(instance).data
    return JsonResponse({'data':data},safe=True)





def index(request):
    """Serve the React app"""
    return render(request, 'index.html')

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Get user profile data
        profile_serializer = UserProfileSerializer(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': profile_serializer.data,
            'tokens': {
                'access': str(access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login user and return JWT tokens"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Get user profile data
        profile_serializer = UserProfileSerializer(user)
        
        return Response({
            'message': 'Login successful',
            'user': profile_serializer.data,
            'tokens': {
                'access': str(access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile"""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile"""
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': serializer.data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def available_packages(request):
    """Get all available packages"""
    packages = Package.objects.filter(is_active=True)
    serializer = PackageSerializer(packages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upgrade_package(request):
    """Upgrade user package"""
    package_id = request.data.get('package_id')
    payment_method = request.data.get('payment_method', 'MPESA')
    
    try:
        package = Package.objects.get(id=package_id, is_active=True)
    except Package.DoesNotExist:
        return Response({
            'error': 'Package not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Create payment record
    payment = Payment.objects.create(
        user=request.user,
        package=package,
        amount=package.price,
        payment_method=payment_method,
        transaction_id=str(uuid.uuid4()),
        status='PENDING'
    )
    
    # For demo purposes, auto-complete free packages
    if package.name == 'FREE':
        payment.status = 'COMPLETED'
        payment.save()
        request.user.upgrade_package(package)
        
        return Response({
            'message': f'Successfully upgraded to {package.name} package',
            'user': UserProfileSerializer(request.user).data,
            'payment': PaymentSerializer(payment).data
        })
    
    # For paid packages, return payment info for frontend to handle
    return Response({
        'message': 'Payment initiated',
        'payment': PaymentSerializer(payment).data,
        'package': PackageSerializer(package).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """Confirm payment and upgrade user package"""
    transaction_id = request.data.get('transaction_id')
    
    try:
        payment = Payment.objects.get(
            transaction_id=transaction_id,
            user=request.user,
            status='PENDING'
        )
    except Payment.DoesNotExist:
        return Response({
            'error': 'Payment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Update payment status (in real app, verify with payment provider)
    payment.status = 'COMPLETED'
    payment.save()
    
    # Upgrade user package
    request.user.upgrade_package(payment.package)
    
    return Response({
        'message': f'Payment confirmed! Upgraded to {payment.package.name} package',
        'user': UserProfileSerializer(request.user).data,
        'payment': PaymentSerializer(payment).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request):
    """Get user's payment history"""
    payments = Payment.objects.filter(user=request.user).order_by('-payment_date')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for the user"""
    user = request.user
    return Response({
        'user': UserProfileSerializer(user).data,
        'stats': {
            'total_payments': user.payments.filter(status='COMPLETED').count(),
            'total_spent': sum(p.amount for p in user.payments.filter(status='COMPLETED')),
            'package_expires_in': user.days_remaining,
            'is_package_active': user.is_package_active
        }
    })