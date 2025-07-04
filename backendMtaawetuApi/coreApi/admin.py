from django.contrib import admin

# Register your models here.
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Package, Payment

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'is_paid_user', 'current_package', 'package_end_date', 'is_active']
    list_filter = ['is_paid_user', 'current_package', 'is_active', 'date_joined']
    search_fields = ['email', 'username', 'phone_number']
    ordering = ['-date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone_number', 'is_paid_user', 'current_package', 
                      'package_start_date', 'package_end_date', 'auto_renew')
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('current_package')

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'duration_days', 'is_active', 'created_at']
    list_filter = ['name', 'is_active', 'created_at']
    search_fields = ['name']
    ordering = ['price']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'price', 'duration_days', 'is_active')
        }),
        ('Features', {
            'fields': ('features',),
            'description': 'Store package features as JSON (e.g., {"max_posts": 100, "analytics": true})'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'package', 'amount', 'payment_method', 'status', 'payment_date']
    list_filter = ['status', 'payment_method', 'payment_date', 'package']
    search_fields = ['user__email', 'user__username', 'transaction_id']
    ordering = ['-payment_date']
    
    fieldsets = (
        ('Payment Info', {
            'fields': ('user', 'package', 'amount', 'payment_method')
        }),
        ('Transaction Details', {
            'fields': ('transaction_id', 'status')
        }),
        ('Timestamps', {
            'fields': ('payment_date', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['payment_date', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'package')
    
    # Custom admin actions
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status='COMPLETED')
        self.message_user(request, f'{updated} payments marked as completed.')
    mark_as_completed.short_description = "Mark selected payments as completed"
    
    def mark_as_failed(self, request, queryset):
        updated = queryset.update(status='FAILED')
        self.message_user(request, f'{updated} payments marked as failed.')
    mark_as_failed.short_description = "Mark selected payments as failed"
    
    actions = ['mark_as_completed', 'mark_as_failed']