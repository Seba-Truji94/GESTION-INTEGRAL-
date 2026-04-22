from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('media-assets', views.MediaAssetViewSet, basename='media-assets')

urlpatterns = [
    path('', include(router.urls)),
    path('catalogo/', views.CatalogoPublicoView.as_view(), name='public-catalogo'),

    path('pedidos/', views.SolicitudPedidoCreateView.as_view(), name='public-pedidos'),
    path('media/', views.MediaAssetListView.as_view(), name='public-media'),
    path('solicitudes/', views.SolicitudPedidoListView.as_view(), name='public-solicitudes'),
    path('solicitudes/<int:pk>/', views.SolicitudPedidoDetailView.as_view(), name='public-solicitudes-detail'),
    path('config/', views.ConfiguracionSitioView.as_view(), name='public-config'),
]
