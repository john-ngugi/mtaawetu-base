from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta

# Create your models here.


class Package(models.Model):
    PACKAGE_TYPES = [
        ('FREE', 'Free'),
        ('BASIC', 'Basic'),
        ('PREMIUM', 'Premium'),
        ('ENTERPRISE', 'Enterprise'),
    ]
    
    name = models.CharField(max_length=50, choices=PACKAGE_TYPES, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    duration_days = models.IntegerField(default=30)  # Package duration in days
    features = models.JSONField(default=dict)  # Store package features as JSON
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_name_display()} - ${self.price}"

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_paid_user = models.BooleanField(default=False)
    current_package = models.ForeignKey(
        Package, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='users'
    )
    package_start_date = models.DateTimeField(null=True, blank=True)
    package_end_date = models.DateTimeField(null=True, blank=True)
    auto_renew = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
    
    @property
    def is_package_active(self):
        """Check if user's current package is still active"""
        if not self.package_end_date:
            return False
        return timezone.now() <= self.package_end_date
    
    @property
    def days_remaining(self):
        """Get days remaining in current package"""
        if not self.package_end_date:
            return 0
        remaining = self.package_end_date - timezone.now()
        return max(0, remaining.days)
    
    def upgrade_package(self, package):
        """Upgrade user to a new package"""
        self.current_package = package
        self.is_paid_user = package.name != 'FREE'
        self.package_start_date = timezone.now()
        self.package_end_date = timezone.now() + timedelta(days=package.duration_days)
        self.save()

class Payment(models.Model):
    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    
    PAYMENT_METHODS = [
        ('MPESA', 'M-Pesa'),
        ('CARD', 'Credit/Debit Card'),
        ('BANK', 'Bank Transfer'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payments')
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='PENDING')
    payment_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.package.name} - {self.status}"