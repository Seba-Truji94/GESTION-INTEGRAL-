from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({"status": "Online", "message": "Kruxel API — Tu Gestión Integral de Software"})

urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('usuarios.urls')),
    # Apps
    path('api/', include('eventos.urls')),
    path('api/', include('cobros.urls')),
    path('api/', include('inventario.urls')),
    path('api/', include('dashboard.urls')),
    path('api/', include('exportaciones.urls')),
    path('api/gastos/', include('gastos.urls')),
    path('api/catalogo/', include('catalogo.urls')),
    path('', api_root),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
