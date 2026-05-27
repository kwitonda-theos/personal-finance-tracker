from django.contrib.auth.models import User as AuthUser
from django.contrib.auth.hashers import make_password
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

from .models import User as FinanceUser


def sync_finance_user_from_auth_user(request, auth_user):
    email = (auth_user.email or '').strip().lower()
    if not email:
        return None

    first_name = (auth_user.first_name or '').strip()
    last_name = (auth_user.last_name or '').strip()
    defaults = {
        'first_name': first_name or email.split('@', 1)[0],
        'last_name': last_name,
        'phone': '',
        'password': auth_user.password or make_password(email),
    }

    finance_user, created = FinanceUser.objects.get_or_create(email=email, defaults=defaults)

    changed = False
    if first_name and finance_user.first_name != first_name:
        finance_user.first_name = first_name
        changed = True
    if last_name and finance_user.last_name != last_name:
        finance_user.last_name = last_name
        changed = True
    if created:
        changed = True

    if changed:
        finance_user.save()

    request.session['user_id'] = finance_user.id
    request.session['user_email'] = finance_user.email
    request.session['user_name'] = f'{finance_user.first_name} {finance_user.last_name}'.strip()
    return finance_user


@receiver(user_logged_in)
def on_user_logged_in(sender, request, user, **kwargs):
    if isinstance(user, AuthUser):
        sync_finance_user_from_auth_user(request, user)