from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from .models import Client, Domain


class DomainInline(admin.TabularInline):
    model = Domain
    extra = 1


@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'slug', 'activo', 'created_on', 'schema_name')
    list_filter = ('activo',)
    inlines = [DomainInline]


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ('domain', 'tenant', 'is_primary')
