from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User as AuthUser
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError, transaction
from django.shortcuts import redirect, render
from django.utils import timezone

from .models import Balance, Expense, Income, User as FinanceUser
from .signals import sync_finance_user_from_auth_user


def _get_logged_in_user(request):
    """Return the logged-in FinanceUser or None (flushing stale sessions)."""
    user_id = request.session.get('user_id')
    if not user_id:
        if getattr(request, 'user', None) and request.user.is_authenticated:
            return sync_finance_user_from_auth_user(request, request.user)
        return None
    try:
        return FinanceUser.objects.select_related('balance').get(id=user_id)
    except FinanceUser.DoesNotExist:
        request.session.flush()
        return None

def pft(request):
    return render(request, 'pft.html')
def dashboard(request):
    user = _get_logged_in_user(request)
    if user is None:
        messages.error(request, 'Please sign in to access the dashboard.')
        return redirect('login')

    balance = getattr(user, 'balance', None)
    incomes = Income.objects.filter(user=user).order_by('-created_at')
    expenses = Expense.objects.filter(user=user).order_by('-created_at')
    context = {
        'current_user': user,
        'current_balance': balance.total_amount if balance else 0,
        'incomes': incomes,
        'expenses': expenses,
    }
    return render(request, 'dashboard.html', context)


def income_page(request):
    user = _get_logged_in_user(request)
    if user is None:
        messages.error(request, 'Please sign in to access this page.')
        return redirect('login')

    balance = getattr(user, 'balance', None)
    incomes = Income.objects.filter(user=user).order_by('-created_at')
    context = {
        'current_user': user,
        'current_balance': balance.total_amount if balance else 0,
        'incomes': incomes,
    }
    return render(request, 'income.html', context)


def expenses_page(request):
    user = _get_logged_in_user(request)
    if user is None:
        messages.error(request, 'Please sign in to access this page.')
        return redirect('login')

    balance = getattr(user, 'balance', None)
    expenses = Expense.objects.filter(user=user).order_by('-created_at')
    context = {
        'current_user': user,
        'current_balance': balance.total_amount if balance else 0,
        'expenses': expenses,
    }
    return render(request, 'expenses.html', context)

def add_income(request):
    """Handle POST to log a new income entry."""
    if request.method != 'POST':
        return redirect('dashboard')

    user = _get_logged_in_user(request)
    if user is None:
        messages.error(request, 'Please sign in to log income.')
        return redirect('login')

    amount_str = request.POST.get('amount', '').strip()
    source = request.POST.get('source', '').strip()
    date_str = request.POST.get('date', '').strip()

    if not amount_str or not source:
        messages.error(request, 'Amount and description are required.')
        return redirect('dashboard')

    try:
        amount = Decimal(amount_str)
        if amount <= 0:
            raise InvalidOperation
    except InvalidOperation:
        messages.error(request, 'Please enter a valid positive amount.')
        return redirect('dashboard')

    created_at = timezone.now()
    if date_str:
        try:
            created_at = timezone.make_aware(datetime.strptime(date_str, '%Y-%m-%d'))
        except ValueError:
            pass

    with transaction.atomic():
        Income.objects.create(user=user, amount=amount, source=source, created_at=created_at)
        bal, _ = Balance.objects.get_or_create(user=user)
        bal.total_amount += amount
        bal.save()

    messages.success(request, f'Income of {amount} recorded.')
    return redirect('dashboard')


def add_expense(request):
    """Handle POST to log a new expense entry."""
    if request.method != 'POST':
        return redirect('dashboard')

    user = _get_logged_in_user(request)
    if user is None:
        messages.error(request, 'Please sign in to log expenses.')
        return redirect('login')

    amount_str = request.POST.get('amount', '').strip()
    expense_desc = request.POST.get('expense', '').strip()
    date_str = request.POST.get('date', '').strip()

    if not amount_str or not expense_desc:
        messages.error(request, 'Amount and description are required.')
        return redirect('dashboard')

    try:
        amount = Decimal(amount_str)
        if amount <= 0:
            raise InvalidOperation
    except InvalidOperation:
        messages.error(request, 'Please enter a valid positive amount.')
        return redirect('dashboard')

    created_at = timezone.now()
    if date_str:
        try:
            created_at = timezone.make_aware(datetime.strptime(date_str, '%Y-%m-%d'))
        except ValueError:
            pass

    with transaction.atomic():
        Expense.objects.create(user=user, amount=amount, expense=expense_desc, created_at=created_at)
        bal, _ = Balance.objects.get_or_create(user=user)
        bal.total_amount -= amount
        bal.save()

    messages.success(request, f'Expense of {amount} recorded.')
    return redirect('dashboard')

def logout(request):
    auth_logout(request)
    request.session.flush()
    messages.success(request, 'You have been signed out.')
    return redirect('login')

def support(request):
    return render(request, 'support.html')

def login(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')

        if not email or not password:
            messages.error(request, 'Email and password are required.')
            return render(request, 'login.html', {'form_data': {'email': email}}, status=400)

        user = authenticate(request, username=email, password=password)
        if user is None:
            messages.error(request, 'Invalid email or password.')
            return render(request, 'login.html', {'form_data': {'email': email}}, status=400)

        auth_login(request, user)
        # sync_finance_user is already called by the user_logged_in signal
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

        if AuthUser.objects.filter(email=email).exists() or AuthUser.objects.filter(username=email).exists():
            messages.error(request, 'An account with that email already exists.')
            return render(request, 'register.html', {'form_data': form_data}, status=400)

        if FinanceUser.objects.filter(email=email).exists():
            messages.error(request, 'An account with that email already exists.')
            return render(request, 'register.html', {'form_data': form_data}, status=400)

        try:
            with transaction.atomic():
                auth_user = AuthUser.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                )
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