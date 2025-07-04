# from django.urls import path 
# from . import views
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )


# urlpatterns = [
#     path('',views.index,name="home"),
#     path('/products',views.index,name="products"),	
#     path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
# ]




from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Frontend routes
    path('', views.index, name="home"),
    path('products/', views.index, name="products"),
    
    # JWT token endpoints (existing)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Authentication endpoints
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    
    # User management endpoints
    path('user/profile/', views.user_profile, name='user_profile'),
    path('user/update/', views.update_profile, name='update_profile'),
    path('user/dashboard/', views.dashboard_stats, name='dashboard_stats'),
    
    # Package management endpoints
    path('packages/', views.available_packages, name='packages'),
    path('packages/upgrade/', views.upgrade_package, name='upgrade_package'),
    
    # Payment endpoints
    path('payments/confirm/', views.confirm_payment, name='confirm_payment'),
    path('payments/history/', views.payment_history, name='payment_history'),
]