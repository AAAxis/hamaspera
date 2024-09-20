# scheduler/urls.py

from django.urls import path
from .views import BookingWizard, ScheduleView, AboutView, available_slots_api


urlpatterns = [
    path('book/', BookingWizard.as_view(), name='book'),
    path('schedule/', ScheduleView.as_view(), name='schedule'),
    path('about/', AboutView.as_view(), name='about'),
    path('available-slots/', available_slots_api, name='available-slots'),
]   