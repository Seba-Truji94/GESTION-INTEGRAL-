from django.urls import path
from . import views

urlpatterns = [
    path('logs/', views.AuditLogListView.as_view(), name='audit-logs'),
    path('logs/accesos/', views.LoginLogListView.as_view(), name='login-logs'),
]
