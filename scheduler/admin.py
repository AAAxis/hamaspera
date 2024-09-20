from django.contrib import admin
from .models import Slot, Booking, Barbers
# Register your models here.

@admin.register(Barbers)
class BarbersAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'is_available')
    list_filter = ('is_available',)
    search_fields = ('name', 'phone')

@admin.register(Slot)
class SlotAdmin(admin.ModelAdmin):
    list_display = ('date', 'time', 'is_available')
    list_filter = ('is_available',)
    search_fields = ('date', 'time')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('slot', 'customer_phone', 'confirmed_at')
    list_filter = ('confirmed_at',)
    search_fields = ('slot__date', 'slot__time', 'customer_phone')

