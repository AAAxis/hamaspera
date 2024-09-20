from django import forms
from .models import Slot, Booking, Barber
from phonenumber_field.formfields import PhoneNumberField

class SelectDateForm(forms.Form):
    date = forms.DateField(
        widget=forms.SelectDateWidget(attrs={'class': 'form-control'}),
        label="Choose a Date"
    )

class SelectTimeForm(forms.Form):
    slot = forms.ModelChoiceField(
        queryset=Slot.objects.none(),
        widget=forms.RadioSelect,
        label="Choose a Time"
    )

    def __init__(self, *args, **kwargs):
        date = kwargs.pop('date', None)
        super(SelectTimeForm, self).__init__(*args, **kwargs)
        if date:
            self.fields['slot'].queryset = Slot.objects.filter(date=date).exclude(booking__isnull=False)

class SelectServiceForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = ['service']
        widgets = {
            'service': forms.RadioSelect(attrs={'class': 'form-check-input'}),
        }

class SelectBarberForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = ['barber']
        widgets = {
            'barber': forms.RadioSelect(attrs={'class': 'form-check-input'}),
        }

class ConfirmBookingForm(forms.Form):
    customer_phone = PhoneNumberField(
        widget=forms.TextInput(attrs={
            'placeholder': 'Enter your phone number',
            'class': 'form-control'
        }),
        label="Your Phone Number"
    )
