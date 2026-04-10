from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('productos', views.ProductoCatalogoViewSet)
router.register('receta-items', views.RecetaItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
