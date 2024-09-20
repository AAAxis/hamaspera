from django import forms
from .models import Booking

class BookingForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = ['customer_phone']
        widgets = {
            'customer_phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter your phone number', 'required': True}),
        }
        labels = {
            'customer_phone': 'Phone Number',
        }
        error_messages = {
            'customer_phone': {
                'required': 'Please enter your phone number.',
                'invalid': 'Please enter a valid phone number.',
            },
        }

