from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Package, Payment

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id', 'name', 'price', 'duration_days', 'features', 'is_active']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'password_confirm', 'phone_number']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        # Assign free package by default
        try:
            free_package = Package.objects.get(name='FREE')
        except Package.DoesNotExist:
            free_package = None
            
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number', ''),
            current_package=free_package,
            is_paid_user=False
        )
        
        if free_package:
            user.upgrade_package(free_package)
            
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')

class UserProfileSerializer(serializers.ModelSerializer):
    current_package = PackageSerializer(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    is_package_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'username', 'phone_number', 'is_paid_user',
            'current_package', 'package_start_date', 'package_end_date',
            'days_remaining', 'is_package_active', 'auto_renew', 'created_at'
        ]
        read_only_fields = [
            'id', 'is_paid_user', 'package_start_date', 'package_end_date', 'created_at'
        ]

class PaymentSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    package_name = serializers.CharField(source='package.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user_email', 'package_name', 'amount', 'payment_method',
            'transaction_id', 'status', 'payment_date'
        ]
        read_only_fields = ['id', 'user_email', 'package_name', 'payment_date']