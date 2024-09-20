from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.conf import settings
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from formtools.wizard.views import SessionWizardView
from .forms import (
    SelectDateForm,
    SelectTimeForm,
    SelectServiceForm,
    SelectBarberForm,
    ConfirmBookingForm
)
from .models import Slot, Booking, Service, Barber
from twilio.rest import Client
from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import SlotSerializer

# Define the order of forms in the wizard
FORMS = [
    ("select_date", SelectDateForm),
    ("select_time", SelectTimeForm),
    ("select_service", SelectServiceForm),
    ("select_barber", SelectBarberForm),
    ("confirm_booking", ConfirmBookingForm),
]

TEMPLATES = {
    "select_date": "scheduler/select_date.html",
    "select_time": "scheduler/select_time.html",
    "select_service": "scheduler/select_service.html",
    "select_barber": "scheduler/pick_barber.html",
    "confirm_booking": "scheduler/confirm_booking.html",
}

class BookingWizard(SessionWizardView):
    form_list = FORMS
    template_name = "scheduler/booking_wizard.html"

    def get_template_names(self):
        return [TEMPLATES[self.steps.current]]

    def get_form_kwargs(self, step=None):
        kwargs = {}
        if step == 'select_time':
            date = self.get_cleaned_data_for_step('select_date')['date']
            kwargs.update({'date': date})
        elif step == 'select_barber':
            service = self.get_cleaned_data_for_step('select_service')['service']
            kwargs.update({'service': service})
        return kwargs

    def done(self, form_list, form_dict, **kwargs):
        with transaction.atomic():
            # Extract data from forms
            date = form_dict['select_date'].cleaned_data['date']
            slot = form_dict['select_time'].cleaned_data['slot']
            service = form_dict['select_service'].cleaned_data['service']
            barber = form_dict['select_barber'].cleaned_data['barber']
            customer_phone = form_dict['confirm_booking'].cleaned_data['customer_phone']

            # Lock the slot to prevent concurrent bookings
            slot = Slot.objects.select_for_update().get(pk=slot.pk)

            if hasattr(slot, 'booking'):
                messages.error(self.request, "Sorry, this slot has just been booked by someone else.")
                return redirect('booking_wizard')

            # Create the booking
            booking = Booking.objects.create(
                slot=slot,
                service=service,
                barber=barber,
                customer_phone=customer_phone
            )

            # Send confirmation SMS
            self.send_confirmation_sms(booking)

            messages.success(self.request, 'Your booking has been confirmed! Check your SMS for details.')
            return redirect('schedule')

    def send_confirmation_sms(self, booking):
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message_body = (
            f"Hello! Your booking for {booking.service.name} with {booking.barber.name} on "
            f"{booking.slot.date.strftime('%B %d, %Y')} at {booking.slot.time.strftime('%I:%M %p')} has been confirmed."
        )
        message = client.messages.create(
            body=message_body,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=str(booking.customer_phone)
        )
        return message

# Additional Views
class ScheduleView(TemplateView):
    template_name = "scheduler/schedule.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        selected_date = self.request.GET.get('date')
        if selected_date:
            slots = Slot.objects.filter(date=selected_date).exclude(booking__isnull=False).order_by('time')
            date_display = selected_date
        else:
            slots = Slot.objects.filter().exclude(booking__isnull=False).order_by('date', 'time')
            date_display = "All Available Slots"
        context.update({
            'slots': slots,
            'selected_date': selected_date,
            'date_display': date_display,
        })
        return context

class AboutView(TemplateView):
    template_name = "scheduler/about.html"


@api_view(['GET'])
def available_slots_api(request):
    slots = Slot.objects.filter().exclude(booking__isnull=False)
    serializer = SlotSerializer(slots, many=True)
    return Response(serializer.data)