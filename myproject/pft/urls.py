from django.urls import path
from . import views

urlpatterns = [
    path('', views.pft, name='pft'),
    path('dashboard', views.dashboard, name='dashboard'),
    path('add-income', views.add_income, name='add_income'),
    path('add-expense', views.add_expense, name='add_expense'),
    path('support', views.support, name='support'),
    path('login', views.login, name='login'),
    path('register', views.register, name='register'),
    path('logout', views.logout, name='logout'),
]