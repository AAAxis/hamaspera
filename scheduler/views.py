from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.views import View
from .models import Slot, Booking, Service, Barber, BarberShop


class BarberShopDetailView(TemplateView):
    template_name = "scheduler/barbershop_detail.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        barbershop_name = self.kwargs.get('name')
        context['barbershop'] = get_object_or_404(BarberShop, name=barbershop_name)
        return context

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
    template_name = "scheduler/index.html"

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
class DashboardView(TemplateView):
    template_name = "scheduler/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    
    
    #     API to get available slots
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
    
