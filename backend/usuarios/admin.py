from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

@admin.register(Usuario)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {'fields': ('rol', 'telefono')}),
    )
    list_display = ['username', 'email', 'get_full_name', 'rol', 'is_staff']
