from urllib import request
from django.shortcuts import render, redirect, get_object_or_404
from .forms import BookingForm
from .models import Slot
from django.contrib import messages
from django.conf import settings
from twilio.rest import Client
from django.http import HttpResponse




#Schedule view
def schedule_view(request):
    slots = Slot.objects.all()
    return render(request, 'scheduler/schedule.html', {'slots': slots})


#Book slot view

def book_slot(request, date):
    available_slots = Slot.objects.filter(date=date, is_available=True)
    if request.method == 'POST':
        form = BookingForm(request.POST)
        if form.is_valid():
            booking = form.save(commit=False)
            booking.date = date
            booking.time = request.POST.get('time')  # Get the time from the form
            booking.slot = get_object_or_404(Slot, id=request.POST.get('slot_id'))  # Get the slot by ID
            booking.save()
            
            return redirect('schedule')
    else:
        form = BookingForm()

    # Check if there are available slots
    if not available_slots.exists():
        return render(request, 'scheduler/book_slot.html', {
            'form': form,
            'date': date,
            'slots': available_slots,
            'no_slots_message': "Slots for this day are not available yet."
        })  

    return render(request, 'scheduler/book_slot.html', {
        'form': form, 
        'date': date,
        'slots': available_slots
    })


# Send confirmation SMS
def send_confirmation_sms(booking):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        body=f"Your booking for {booking.date} at {booking.time} has been confirmed.",
        from_=settings.TWILIO_PHONE_NUMBER,
        to=booking.customer_phone
    )
    return message

def about_view(request):
    return render(request, 'scheduler/about.html')

def pick_service(booking):
    return render(request, 'scheduler/pick_service.html', {'booking': booking})

def confirm_booking(request):
    if request.method == 'POST':
        form = BookingForm(request.POST)
        if form.is_valid():
            booking = form.save(commit=False)
            booking.date = request.POST.get('date')
            booking.time = request.POST.get('time')
            booking.slot = get_object_or_404(Slot, id=request.POST.get('slot_id'))
            booking.customer_phone = request.POST.get('customer_phone')
            booking.save()
    return render(request, 'scheduler/confirm_booking.html')

def pick_service(request):
    return render(request, 'scheduler/pick_service.html')


