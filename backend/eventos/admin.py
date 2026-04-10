from django.contrib import admin
from django.apps import apps
from django.db.models import ManyToManyField
from .models import Presupuesto, ItemPresupuesto

class ItemPresupuestoInline(admin.TabularInline):
    model = ItemPresupuesto
    extra = 0

@admin.register(Presupuesto)
class PresupuestoAdmin(admin.ModelAdmin):
    list_display = ('numero', 'evento', 'total', 'created_at')
    search_fields = ('numero', 'cliente_nombre')
    list_filter = ('created_at', 'incluir_iva')
    inlines = [ItemPresupuestoInline]

app = apps.get_app_config('eventos')
for model in app.get_models():
    if model in [Presupuesto, ItemPresupuesto]:
        continue
    try:
        class GenericAdmin(admin.ModelAdmin):
            list_display = [f.name for f in model._meta.fields if not isinstance(f, ManyToManyField)]
            search_fields = [f.name for f in model._meta.fields if f.get_internal_type() in ('CharField', 'TextField')]
            list_filter = [f.name for f in model._meta.fields if f.get_internal_type() in ('BooleanField', 'ForeignKey', 'DateField', 'DateTimeField')][:4]
        admin.site.register(model, GenericAdmin)
    except admin.sites.AlreadyRegistered:
        pass
