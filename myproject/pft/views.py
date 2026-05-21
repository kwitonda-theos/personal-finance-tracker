from django.contrib import messages
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.db import IntegrityError, transaction
from django.shortcuts import redirect, render

from .models import Balance, User as FinanceUser

def pft(request):
    return render(request, 'pft.html')
def dashboard(request):
    return render(request, 'dashboard.html')
def support(request):
    return render(request, 'support.html')

def login(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')

        if not email or not password:
            messages.error(request, 'Email and password are required.')
            return render(request, 'login.html', {'form_data': {'email': email}}, status=400)

        try:
            user = FinanceUser.objects.get(email=email)
        except FinanceUser.DoesNotExist:
            messages.error(request, 'Invalid email or password.')
            return render(request, 'login.html', {'form_data': {'email': email}}, status=400)

        if not check_password(password, user.password):
            messages.error(request, 'Invalid email or password.')
            return render(request, 'login.html', {'form_data': {'email': email}}, status=400)

        request.session['user_id'] = user.id
        request.session['user_email'] = user.email
        request.session['user_name'] = f'{user.first_name} {user.last_name}'.strip()
        messages.success(request, 'Logged in successfully.')
        return redirect('dashboard')

    return render(request, 'login.html')

def register(request):
    if request.method == 'POST':
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        email = request.POST.get('email', '').strip().lower()
        phone = request.POST.get('phone', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')

        form_data = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone': phone,
        }

        if not all([first_name, last_name, email, phone, password, confirm_password]):
            messages.error(request, 'All fields are required.')
            return render(request, 'register.html', {'form_data': form_data}, status=400)

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'register.html', {'form_data': form_data}, status=400)

        if FinanceUser.objects.filter(email=email).exists():
            messages.error(request, 'An account with that email already exists.')
            return render(request, 'register.html', {'form_data': form_data}, status=400)

        try:
            with transaction.atomic():
                user = FinanceUser.objects.create(
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    phone=phone,
                    password=make_password(password),
                )
                Balance.objects.create(user=user)
        except IntegrityError:
            messages.error(request, 'Unable to create your account right now.')
            return render(request, 'register.html', {'form_data': form_data}, status=400)

        messages.success(request, 'Registration complete. Please sign in.')
        return redirect('login')

    return render(request, 'register.html')