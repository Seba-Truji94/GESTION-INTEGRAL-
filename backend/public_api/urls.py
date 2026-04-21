from django.urls import path
from . import views

urlpatterns = [
    path('catalogo/', views.CatalogoPublicoView.as_view(), name='public-catalogo'),
    path('pedidos/', views.SolicitudPedidoCreateView.as_view(), name='public-pedidos'),
]
