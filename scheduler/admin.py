from django.contrib import admin
from .models import Booking, Barber, Service, Slot, Shift, BarberShop

@admin.register(BarberShop)
class BarberShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'phone', 'email')
    search_fields = ('name', 'address', 'phone', 'email')
    list_filter = ('name', 'address', 'phone', 'email')
@admin.register(Barber)
class BarberAdmin(admin.ModelAdmin):        
    list_display = ('name', 'specialty')  
    list_filter = ('specialty',)

@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('barber', 'start_time', 'end_time', 'is_available')
    list_filter = ['is_available'] 
    search_fields = ['barber__name']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('slot', 'customer_phone', 'confirmed_at', 'barber', 'service')
    list_filter = ('confirmed_at',)
    search_fields = ('slot__time', 'barber__name', 'service__name', 'customer_phone')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price')
    search_fields = ('name',)
    list_filter = ('price',)

@admin.register(Slot)
class SlotAdmin(admin.ModelAdmin):
    list_display = ('service', 'date', 'time', 'is_available')
    list_filter = ('is_available',)
    search_fields = ('service__name', 'date', 'time')



