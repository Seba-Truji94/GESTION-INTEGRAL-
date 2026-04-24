from django.db import models
from django_tenants.models import TenantMixin, DomainMixin


class Client(TenantMixin):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, help_text='Identificador único, ej: ryf')
    activo = models.BooleanField(default=True)
    created_on = models.DateField(auto_now_add=True)

    auto_create_schema = True

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'

    def __str__(self):
        return self.name


class Domain(DomainMixin):
    class Meta:
        verbose_name = 'Dominio'
        verbose_name_plural = 'Dominios'
