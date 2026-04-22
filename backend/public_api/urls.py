from django.urls import path
from . import views

urlpatterns = [
    path('catalogo/', views.CatalogoPublicoView.as_view(), name='public-catalogo'),
    path('pedidos/', views.SolicitudPedidoCreateView.as_view(), name='public-pedidos'),
    path('media/', views.MediaAssetListView.as_view(), name='public-media'),
    path('solicitudes/', views.SolicitudPedidoListView.as_view(), name='public-solicitudes'),
    path('solicitudes/<int:pk>/', views.SolicitudPedidoDetailView.as_view(), name='public-solicitudes-detail'),
    path('config/', views.ConfiguracionSitioView.as_view(), name='public-config'),
]
