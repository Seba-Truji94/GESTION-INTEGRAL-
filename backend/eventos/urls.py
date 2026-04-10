from django.urls import path
from . import views

urlpatterns = [
    path('eventos/', views.EventoListCreateView.as_view(), name='eventos-list'),
    path('eventos/<int:pk>/', views.EventoDetailView.as_view(), name='eventos-detail'),
    path('presupuestos/', views.PresupuestoListCreateView.as_view(), name='presupuestos-list'),
    path('presupuestos/<int:pk>/', views.PresupuestoDetailView.as_view(), name='presupuestos-detail'),
    path('presupuestos/publico/<int:pk>/', views.PresupuestoPublicoView.as_view(), name='presupuestos-publico'),
    path('presupuestos/<int:presupuesto_pk>/items/', views.ItemPresupuestoListCreateView.as_view(), name='items-list'),
    path('presupuestos/<int:presupuesto_pk>/items/<int:pk>/', views.ItemPresupuestoDetailView.as_view(), name='items-detail'),
]
