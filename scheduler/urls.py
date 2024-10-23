from django.urls import path
from .views import (ScheduleView, AboutView, available_slots_api, 
                    BarberShopDetailView, BarberShopBookingView, 
                    RegisterView, LoginView, ForgotView, 
                    DashboardView, EditView, HoursView, EmployeesView, DetailsView, DoneView, IndexView, LogoutView, OrderView, SuccessView, HistoryView, SubscriptionsView, ShiftScheduleView)  # Import the new view

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register_business'),  # Registration path
    path('login/', LoginView.as_view(), name='login'),  # Login path
    path('forgot/', ForgotView.as_view(), name='forgot'),  # Forgot password path
    path('success/', SuccessView.as_view(), name='success'),  # Forgot password path
    path('dashboard/', DashboardView.as_view(), name='dashboard'),  # Dashboard path
    path('edit/', EditView.as_view(), name='edit'),  # Dashboard path
    path('order/', OrderView.as_view(), name='order'),  # Dashboard path
    path('hours/', HoursView.as_view(), name='hours'),  # Dashboard path
    path('employees/', EmployeesView.as_view(), name='employees'),  # Dashboard path
    path('subscriptions/', SubscriptionsView.as_view(), name='subscriptions'),  # Dashboard path
    path('', ScheduleView.as_view(), name='schedule'),
    path('index', IndexView.as_view(), name='index'),
    path('about/', AboutView.as_view(), name='about'),
    path('done/', DoneView.as_view(), name='done'),
    path('details/', DetailsView.as_view(), name='details'),
    path('orders_history/', HistoryView.as_view(), name='orders_history'),
    path('available-slots/<str:name>/', available_slots_api.as_view(), name='available-slots'),
    path('barbershop/<str:id>/', BarberShopDetailView.as_view(), name='barbershop_detail'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('barbershop/<str:name>/book/', BarberShopBookingView.as_view(), name='barbershop_booking'),
    path('shift_schedule/', ShiftScheduleView.as_view(), name='shift_schedule'),  # New path
]
