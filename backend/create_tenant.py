"""
Uso: python manage.py shell < create_tenant.py
O llamar create_tenant(name, slug, domain) desde shell de Django.

Ejemplo:
  python manage.py shell -c "
  from create_tenant import create_tenant
  create_tenant('RyF Banquetería', 'ryf', 'ryfbanqueteria.kruxel.cl')
  "
"""
import django
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')


def create_tenant(name: str, slug: str, domain: str, is_primary: bool = True):
    from tenants.models import Client, Domain

    if Client.objects.filter(schema_name=slug).exists():
        print(f'[SKIP] Tenant "{slug}" ya existe.')
        return

    tenant = Client(schema_name=slug, name=name, slug=slug)
    tenant.save()  # auto crea el schema y corre migrate_schemas

    Domain.objects.create(domain=domain, tenant=tenant, is_primary=is_primary)

    print(f'[OK] Tenant "{name}" creado — schema: {slug} — dominio: {domain}')
    return tenant


if __name__ == '__main__':
    # Uso directo: python create_tenant.py <name> <slug> <domain>
    if len(sys.argv) != 4:
        print('Uso: python create_tenant.py "Nombre Cliente" slug dominio.kruxel.cl')
        sys.exit(1)
    django.setup()
    create_tenant(sys.argv[1], sys.argv[2], sys.argv[3])
