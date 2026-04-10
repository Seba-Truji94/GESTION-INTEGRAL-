from django.urls import path, include
from rest_framework.routers import SimpleRouter
from . import views

router = SimpleRouter()
router.register('datos-transferencia', views.DatosTransferenciaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('cobros/', views.CobroListCreateView.as_view(), name='cobros-list'),
    path('cobros/<int:pk>/', views.CobroDetailView.as_view(), name='cobros-detail'),
    path('cobros/<int:cobro_pk>/pagos/', views.PagoCreateView.as_view(), name='pagos-create'),
    path('cobros/<int:cobro_pk>/pagos/list/', views.PagoListView.as_view(), name='pagos-list'),
    path('pagos/<int:pk>/', views.PagoDetailView.as_view(), name='pagos-detail'),
    path('eventos/<int:evento_pk>/seguimiento/', views.SeguimientoListView.as_view(), name='seguimiento-list'),
    path('eventos/<int:evento_pk>/seguimiento/crear/', views.SeguimientoCreateView.as_view(), name='seguimiento-create'),
]
