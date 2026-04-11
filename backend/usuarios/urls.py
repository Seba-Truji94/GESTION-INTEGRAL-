from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.MeView.as_view(), name='me'),
    path('usuarios/', views.UsuarioListCreateView.as_view(), name='usuarios-list'),
    path('usuarios/<int:pk>/', views.UsuarioDetailView.as_view(), name='usuarios-detail'),
    path('login-config/', views.LoginConfigView.as_view(), name='login-config'),
]
