# Multi-Tenant Migration Guide

## Primera vez (servidor limpio)

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Crear schema público y tablas compartidas
python manage.py migrate_schemas --shared

# 3. Crear tenant "public" obligatorio de django-tenants
python manage.py shell -c "
from tenants.models import Client, Domain
if not Client.objects.filter(schema_name='public').exists():
    t = Client(schema_name='public', name='Public', slug='public')
    t.save(run_syncdb=True)
    Domain.objects.create(domain='localhost', tenant=t, is_primary=True)
    print('Public tenant created')
"

# 4. Crear primer cliente real (RyF)
python manage.py shell -c "
from create_tenant import create_tenant
create_tenant('RyF Banquetería', 'ryf', 'ryfbanqueteria.kruxel.cl')
"

# 5. Crear superusuario (en schema ryf)
python manage.py tenant_command createsuperuser --schema=ryf
```

## Agregar nuevo cliente

```bash
python manage.py shell -c "
from create_tenant import create_tenant
create_tenant('Nombre Cliente', 'slug', 'subdominio.kruxel.cl')
"

# Crear usuario admin para el cliente
python manage.py tenant_command createsuperuser --schema=slug
```

## Correr comando en tenant específico

```bash
python manage.py tenant_command <comando> --schema=<slug>

# Ejemplos:
python manage.py tenant_command migrate --schema=ryf
python manage.py tenant_command loaddata seed.json --schema=ryf
```

## Migración desde instancia single-tenant existente

Si ya tenías datos en la DB, necesitas moverlos al schema del tenant:

```bash
# 1. Exportar datos actuales (antes de cambiar a multi-tenant)
python manage.py dumpdata --exclude=auth.permission --exclude=contenttypes > backup.json

# 2. Hacer setup multi-tenant (pasos arriba)

# 3. Importar datos al tenant correcto
python manage.py tenant_command loaddata backup.json --schema=ryf
```

## Estructura de dominios en Caddy

Cada tenant necesita su bloque en el Caddyfile del servidor:

```caddyfile
ryfbanqueteria.kruxel.cl {
    reverse_proxy gestion_caddy_prod:80
}

nuevocliente.kruxel.cl {
    reverse_proxy gestion_caddy_prod:80
}
```

El mismo Docker stack sirve todos los tenants — el subdomain identifica el schema.
