from django.urls import path
from . import views

urlpatterns = [
    path('', views.pft, name='pft'),
    path('dashboard', views.dashboard, name='dashboard'),
    path('support', views.support, name='support'),
    path('login', views.login, name='login'),
    path('register', views.register, name='register'),
]