from django.urls import path
from .views import (ScheduleView, AboutView, available_slots_api, 
                    BarberShopDetailView, BarberShopBookingView, 
                    RegisterView, LoginView, ForgotView, 
                    DashboardView, EditView)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register_business'),  # Registration path
    path('login/', LoginView.as_view(), name='login'),  # Login path
    path('forgot/', ForgotView.as_view(), name='forgot'),  # Forgot password path
    path('dashboard/', DashboardView.as_view(), name='dashboard'),  # Dashboard path
     path('edit/', EditView.as_view(), name='edit'),  # Dashboard path
    path('', ScheduleView.as_view(), name='schedule'),
    path('about/', AboutView.as_view(), name='about'),
    path('available-slots/<str:name>/', available_slots_api.as_view(), name='available-slots'),
    path('<str:name>/', BarberShopDetailView.as_view(), name='barbershop_detail'),
    path('<str:name>/book/', BarberShopBookingView.as_view(), name='barbershop_booking'),
   
]
