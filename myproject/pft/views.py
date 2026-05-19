from django.http import HttpResponse
from django.shortcuts import render

def pft(request):
    return render(request, 'pft.html')
def dashboard(request):
    return render(request, 'dashboard.html')
def support(request):
    return render(request, 'support.html')