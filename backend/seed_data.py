"""
Seed script to populate the database with sample data.
Run with: python manage.py shell < seed_data.py
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from eventos.models import Evento, Presupuesto, ItemPresupuesto
from cobros.models import Cobro, Pago, SeguimientoEvento
from inventario.models import Producto, MovimientoStock
from datetime import date, timedelta
import random

Usuario = get_user_model()

# Create users
usuarios_data = [
    ('admin', 'admin@gestion.cl', 'Admin', 'Principal', 'admin', 'admin123'),
    ('operador', 'operador@gestion.cl', 'Juan', 'Operador', 'operador', 'oper123'),
    ('ventas1', 'ventas1@gestion.cl', 'Laura', 'Ventas', 'vendedor', 'ventas123'),
    ('ventas2', 'ventas2@gestion.cl', 'Carlos', 'Ventas', 'vendedor', 'ventas123'),
    ('logistica1', 'logis@gestion.cl', 'Pedro', 'Logística', 'operador', 'logis123'),
    ('finanzas1', 'finanzas@gestion.cl', 'Sofía', 'Finanzas', 'admin', 'finan123'),
    ('chef1', 'chef@gestion.cl', 'Marta', 'Cocina', 'operador', 'chef123'),
    ('garzon1', 'garzon1@gestion.cl', 'Diego', 'Servicio', 'vendedor', 'servi123'),
    ('seguridad1', 'segur@gestion.cl', 'Jorge', 'Seguridad', 'operador', 'segur123'),
    ('soporte1', 'soporte@gestion.cl', 'Elena', 'Soporte', 'admin', 'sopor123'),
]

for username, email, fn, ln, rol, password in usuarios_data:
    u, created = Usuario.objects.get_or_create(username=username, defaults={
        'email': email, 'first_name': fn, 'last_name': ln,
        'rol': rol, 'is_staff': (rol == 'admin'), 'is_superuser': (rol == 'admin')
    })
    if created or username in ['admin', 'operador']:
        u.set_password(password)
        u.save()
print("✅ Usuarios creados (10)")

# Create Bank Transfer data (DatosTransferencia)
from cobros.models import DatosTransferencia
bancos_data = [
    ('Banco Santander', 'Gestión Integral SpA', '76.123.456-K', '2523152352323', 'Cuenta Corriente', 'pagos@gestion.cl'),
    ('Banco Estado', 'Gestión Integral SpA', '76.123.456-K', '123456789', 'Cuenta Rut', 'pagos@gestion.cl'),
    ('Banco de Chile', 'Gestión Integral SpA', '76.123.456-K', '987654321', 'Cuenta Corriente', 'pagos@gestion.cl'),
    ('BCI', 'Gestión Integral SpA', '76.123.456-K', '555444333', 'Cuenta Vista', 'pagos@gestion.cl'),
    ('Scotiabank', 'Gestión Integral SpA', '76.123.456-K', '111222333', 'Cuenta Corriente', 'pagos@gestion.cl'),
    ('Itaú', 'Olivia Pérez', '15.432.123-1', '777888999', 'Cuenta Corriente', 'olivia@eventos.cl'),
    ('Banco Ripley', 'Roberto Gomez', '12.345.678-9', '444555666', 'Cuenta Vista', 'roberto@eventos.cl'),
    ('Banco Falabella', 'Catering Express', '88.999.000-1', '222111333', 'Cuenta Corriente', 'contabilidad@catering.cl'),
    ('HSBC', 'Eventos VIP', '99.111.222-3', '666777888', 'Cuenta Corriente', 'vip@eventos.cl'),
    ('BBVA', 'Banquetería Solar', '77.555.444-2', '333222111', 'Cuenta Corriente', 'solar@banquet.cl'),
]

for i, (banco, titular, rut, num, tipo, email) in enumerate(bancos_data):
    DatosTransferencia.objects.get_or_create(banco=banco, defaults={
        'titular': titular, 'rut': rut, 'numero_cuenta': num,
        'tipo_cuenta': tipo, 'email': email, 'activo': (i == 0)
    })
print("✅ Datos de transferencia creados (10)")

# Create products
# (Existing products are fine, just ensuring 12+)
# ... (same as before)

# Create events
# (Existing events 10)
# ... (same as before)

# Create 10 more events to ensure diversity
for i in range(11, 21):
    nombre = f"Evento Prueba {i}"
    cliente = f"Cliente Prueba {i}"
    fecha = date.today() + timedelta(days=random.randint(-30, 90))
    tipo = random.choice([t[0] for t in Evento.TIPOS])
    pax = random.randint(20, 300)
    estado = random.choice([e[0] for e in Evento.ESTADOS])
    
    evento, created = Evento.objects.get_or_create(nombre=nombre, defaults={
        'cliente': cliente, 'fecha': fecha, 'tipo_evento': tipo,
        'pax': pax, 'lugar': f"Local Prueba {i}", 'estado': estado, 'created_by': admin
    })
    
    if created:
        pres = Presupuesto.objects.create(
            evento=evento, estado='aprobado' if estado in ['confirmado', 'en_proceso', 'completado'] else 'borrador',
            descuento_pct=random.choice([0, 5, 10]), forma_pago='50_50',
            cliente_nombre=cliente, created_by=admin
        )
        # Add random items
        items_count = random.randint(3, 7)
        for _ in range(items_count):
            ItemPresupuesto.objects.create(
                presupuesto=pres, descripcion=f"Item de prueba {random.randint(1,100)}",
                categoria=random.choice(['I', 'M', 'O']),
                cantidad=random.randint(1, 10), costo_unitario=random.randint(1000, 5000),
                venta_unitario=random.randint(6000, 15000)
            )
        pres.recalcular()
        
        if estado in ['confirmado', 'en_proceso', 'completado']:
            cobro = Cobro.objects.create(presupuesto=pres, monto_total=pres.total, created_by=admin)
            if random.random() > 0.5:
                Pago.objects.create(
                    cobro=cobro, monto=pres.total if estado == 'completado' else pres.total / 2,
                    metodo_pago=random.choice(['efectivo', 'transferencia']),
                    fecha_pago=date.today(), created_by=admin
                )
                cobro.actualizar_estado()

print("✅ Más eventos, presupuestos y cobros creados")
print("✅ Seed completo!")
print(f"")
print(f"👤 Admin: admin / admin123")
print(f"👤 Operador: operador / oper123")
