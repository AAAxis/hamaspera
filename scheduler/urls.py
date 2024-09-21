from django.urls import path
from .views import ScheduleView, AboutView, available_slots_api, BarberShopDetailView, BarberShopBookingView, RegisterView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register_business'),  # Specific path for registration
    path('', ScheduleView.as_view(), name='schedule'),
    path('about/', AboutView.as_view(), name='about'),
    path('available-slots/<str:name>/', available_slots_api.as_view(), name='available-slots'),
    path('<str:name>/', BarberShopDetailView.as_view(), name='barbershop_detail'),
    path('<str:name>/book/', BarberShopBookingView.as_view(), name='barbershop_booking'),

    # Other URL patterns...
]
