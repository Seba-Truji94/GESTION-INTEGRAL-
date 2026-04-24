from django.contrib import admin
from django.urls import path
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({"status": "Online", "message": "Kruxel — Panel de administración de tenants"})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_root),
]
