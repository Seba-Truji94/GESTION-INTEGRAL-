from django.urls import path
from . import views

urlpatterns = [
    path('productos/', views.ProductoListCreateView.as_view(), name='productos-list'),
    path('productos/<int:pk>/', views.ProductoDetailView.as_view(), name='productos-detail'),
    path('productos/alertas/', views.ProductoAlertasView.as_view(), name='productos-alertas'),
    path('movimientos/', views.MovimientoListCreateView.as_view(), name='movimientos-list'),
]
