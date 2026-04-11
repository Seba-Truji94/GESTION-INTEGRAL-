from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, LoginConfiguracion

@admin.register(Usuario)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {'fields': ('rol', 'telefono', 'avatar')}),
    )
    list_display = ['username', 'email', 'get_full_name', 'rol', 'is_staff']


@admin.register(LoginConfiguracion)
class LoginConfigAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'color1', 'color2', 'color3', 'pixel_filter']

    def has_add_permission(self, request):
        # Allow only one instance (Singleton)
        return not LoginConfiguracion.objects.exists()
