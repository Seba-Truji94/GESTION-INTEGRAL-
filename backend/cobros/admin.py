from django.contrib import admin
from django.apps import apps
from django.db.models import ManyToManyField

app = apps.get_app_config('cobros')
for model in app.get_models():
    try:
        class GenericAdmin(admin.ModelAdmin):
            list_display = [f.name for f in model._meta.fields if not isinstance(f, ManyToManyField)]
            search_fields = [f.name for f in model._meta.fields if f.get_internal_type() in ('CharField', 'TextField')]
            list_filter = [f.name for f in model._meta.fields if f.get_internal_type() in ('BooleanField', 'ForeignKey', 'DateField', 'DateTimeField')][:4]
        admin.site.register(model, GenericAdmin)
    except admin.sites.AlreadyRegistered:
        pass
