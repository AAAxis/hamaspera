from django.db import models

class Barbers(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Slot(models.Model):
    date = models.DateField()
    time = models.TimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.date} at {self.time}"

class Booking(models.Model):
    slot = models.ForeignKey(Slot, on_delete=models.CASCADE)
    barber = models.ForeignKey(Barbers, on_delete=models.CASCADE, null=True)  # Make it nullable temporarily
    customer_phone = models.CharField(max_length=15)
    confirmed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking for {self.customer_phone} on {self.slot}"