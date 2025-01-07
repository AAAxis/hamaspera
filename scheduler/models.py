from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
import uuid


class BarberShop(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    phone = PhoneNumberField(null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    logo = models.ImageField(upload_to='barber_shops/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='barber_shops/')
     
    
    def __str__(self):
        return self.name
    
class Service(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    barber_shop = models.ForeignKey(BarberShop, on_delete=models.CASCADE, related_name='services', default=1)
    def __str__(self):
        return self.name
    
class Barber(models.Model):
    name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    barber_shop = models.ForeignKey(BarberShop, on_delete=models.CASCADE, related_name='barbers', default=1)

    def __str__(self):
        return self.name
    class Meta:
        pass

class Slot(models.Model):
    barber_shop = models.ForeignKey(BarberShop, on_delete=models.CASCADE, related_name='slots', default=1)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.service.name} - {self.date} {self.time}" 
    
class Shift(models.Model):
    barber = models.ForeignKey(Barber, on_delete=models.CASCADE, related_name='shifts')
    barber_shop = models.ForeignKey(BarberShop, on_delete=models.CASCADE, related_name='shifts', default=1)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.barber.name} - {self.start_time} to {self.end_time}"
    
class Booking(models.Model):
    slot = models.ForeignKey(Slot, on_delete=models.CASCADE)
    barber_shop = models.ForeignKey(BarberShop, on_delete=models.CASCADE, related_name='bookings', default=1)
    customer_phone = PhoneNumberField(null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    barber = models.ForeignKey(Barber, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')

    def __str__(self):
        return f"{self.slot.service.name} - {self.slot.date} {self.slot.time}"     
    
class Customer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    phone = PhoneNumberField()

    def __str__(self):
        return self.name
    
