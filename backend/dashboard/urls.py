from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('dashboard/reportes/', views.ReportesView.as_view(), name='reportes'),
]
