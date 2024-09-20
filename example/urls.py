from django.urls import path
from . import views


urlpatterns = [
    
    path('', views.schedule_view, name='schedule'),
    path('book_slot/<str:date>/', views.book_slot, name='book_slot'),
    path('about/', views.about_view, name='about'),
]
