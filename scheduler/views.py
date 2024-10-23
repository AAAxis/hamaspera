from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.views import View
from .models import Slot, Booking, Service, Barber, BarberShop

from google.cloud import firestore
import calendar

# myapp/views.py
from django.shortcuts import render
from django.http import JsonResponse
import json
import random
import requests
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

# Global variables
bot_connected = True  # Set to True to indicate bot is connected
error_messages = []  # List to store error messages

def telegram_webhook(request):
    global error_messages  # Use global variables to modify them

    if request.method == 'POST':
        update = request.body.decode('utf-8')  # Get the raw body
        logging.info("Received update: %s", update)

        try:
            # Process incoming Telegram message
            message = json.loads(update)['message']
            chat_id = message['chat']['id']
            username = message['chat'].get('username', '')
            first_name = message['chat'].get('first_name', '')

            # Generate a random 6-digit verification code
            verification_code = str(random.randint(100000, 999999))

            # Send the verification code back to the user
            send_telegram_message(chat_id, verification_code)

            return JsonResponse({'status': 'success', 'chat_id': chat_id, 'verification_code': verification_code}, status=200)
        
        except Exception as e:
            error_message = f"Failed to process update: {e}"
            error_messages.append(error_message)  # Store the error message
            logging.error(error_message)
            return JsonResponse({'status': 'error', 'message': 'Failed to process update'}, status=500)

    return JsonResponse({'status': 'method_not_allowed'}, status=405)

def index(request):
    return render(request, 'index.html', {'bot_connected': bot_connected, 'error_messages': error_messages})

def send_telegram_message(chat_id, verification_code):
    token = '5278311018:AAHHgwcyvabDWaqIMKByTMQJS0cAWm7GyfM'  # Replace with your bot token
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    payload = {
        'chat_id': chat_id,
        'text': f'Your verification code is: {verification_code}'
    }
    response = requests.post(url, json=payload)
    if response.status_code != 200:
        raise Exception("Telegram API responded with status code: {}".format(response.status_code))

class BarberShopDetailView(View):
    def get(self, request, id):
        # You can now use the 'id' variable directly
        # Pass it to the template context or handle it as needed
        return render(request, 'scheduler/barbershop_detail.html', {'barbershop_id': id})

class BarberShopBookingView(TemplateView):
    template_name = "scheduler/book_slot.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        barbershop_name = self.kwargs.get('name')
        barbershop = get_object_or_404(BarberShop, name=barbershop_name)
        context['barbershop'] = barbershop
        context['services'] = barbershop.services.all()
        context['barbers'] = barbershop.barbers.all()
        return context

    def post(self, request, *args, **kwargs):
        barbershop_name = self.kwargs.get('name')
        barbershop = get_object_or_404(BarberShop, name=barbershop_name)
        service_id = request.POST.get('service_id')
        barber_id = request.POST.get('barber_id')
        date = request.POST.get('date')
        time = request.POST.get('time')
        customer_phone = request.POST.get('customer_phone')

        service = get_object_or_404(Service, id=service_id, barber_shop=barbershop)
        barber = get_object_or_404(Barber, id=barber_id, barber_shop=barbershop)
        slot = Slot.objects.create(
            barber_shop=barbershop,
            service=service,
            date=date,
            time=time,
            is_available=False
        )
        booking = Booking.objects.create(
            slot=slot,
            barber_shop=barbershop,
            customer_phone=customer_phone,
            barber=barber,
            service=service
        )
        messages.success(request, 'Your booking has been confirmed!')
        return redirect('barbershop_detail', name=barbershop_name)
    
class ScheduleView(TemplateView):
    template_name = "scheduler/schedule.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['barbershops'] = BarberShop.objects.all()
        return context
    
class AboutView(TemplateView):
    template_name = "scheduler/about.html"

    

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['barbershops'] = BarberShop.objects.all()
        return context
    

class SuccessView(TemplateView):
    template_name = "scheduler/success.html"

    

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['barbershops'] = BarberShop.objects.all()
        return context
    



class SubscriptionsView(View):
    def get(self, request):
        # You can now use the 'id' variable directly
        # Pass it to the template context or handle it as needed
        return render(request, 'scheduler/subscription.html')

class DoneView(View):
    def get(self, request):
        # You can now use the 'id' variable directly
        # Pass it to the template context or handle it as needed
        return render(request, 'scheduler/done.html')

class DoneView(View):
    def get(self, request):
        # You can now use the 'id' variable directly
        # Pass it to the template context or handle it as needed
        return render(request, 'scheduler/done.html')



class DetailsView(View):
    def get(self, request):
        # You can now use the 'id' variable directly
        # Pass it to the template context or handle it as needed
        return render(request, 'scheduler/details.html')


class HistoryView(TemplateView):
    template_name = "scheduler/orders_history.html"

    

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['barbershops'] = BarberShop.objects.all()
        return context
    

      
#     API to get available slots
class RegisterView(TemplateView):
    template_name = "scheduler/register_business.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    
    #     API to get available slots
class ForgotView(TemplateView):
    template_name = "scheduler/forgot_password.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    

    #     API to get available slots
class OrderView(TemplateView):
    template_name = "scheduler/order.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    
    
        #     API to get available slots
class DashboardView(TemplateView):
    template_name = "scheduler/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    
        #     API to get available slots
class EditView(TemplateView):
    template_name = "scheduler/edit.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    
            #     API to get available slots
class EmployeesView(TemplateView):
    template_name = "scheduler/employees.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    

            #     API to get available slots
class HoursView(TemplateView):
    template_name = "scheduler/working_hours.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    
class LoginView(TemplateView):
    template_name = "scheduler/login_business.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

class available_slots_api(View):    
    def get(self, request, *args, **kwargs):
        barbershop_name = self.kwargs.get('name')
        barbershop = get_object_or_404(BarberShop, name=barbershop_name)
        services = barbershop.services.all()
        barbers = barbershop.barbers.all()
        slots = Slot.objects.filter(barber_shop=barbershop, is_available=True)
        return JsonResponse({'services': list(services.values()), 'barbers': list(barbers.values()), 'slots': list(slots.values())})
    

class LogoutView(View):
    def get(self, request):
        # Your logout logic here
        return redirect('home')

class ShiftScheduleView(View):
    def get(self, request):
        # List of week days starting from Sunday
        week_days = list(calendar.day_name)

        return render(request, 'scheduler/shift_schedule.html', {
            'week_days': week_days,
        })