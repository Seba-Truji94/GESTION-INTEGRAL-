import os
import django
import random
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from eventos.models import Evento, Presupuesto, ItemPresupuesto
from cobros.models import Cobro, Pago, DatosTransferencia
from inventario.models import Producto

Usuario = get_user_model()

# 1. Create 10 Users
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

users = []
for username, email, fn, ln, rol, password in usuarios_data:
    u, created = Usuario.objects.get_or_create(username=username, defaults={
        'email': email, 'first_name': fn, 'last_name': ln,
        'rol': rol, 'is_staff': (rol == 'admin'), 'is_superuser': (rol == 'admin')
    })
    if created:
        u.set_password(password)
        u.save()
    users.append(u)
admin_user = users[0]
print(f"{len(users)} usuarios creados/verificados")

# 2. Create 10 Bank Details
bancos_data = [
    ('Banco Santander', 'Gestion Integral SpA', '76.123.456-K', '2523152352323', 'Cuenta Corriente', 'pagos@gestion.cl'),
    ('Banco Estado', 'Gestion Integral SpA', '76.123.456-K', '123456789', 'Cuenta Rut', 'pagos@gestion.cl'),
    ('Banco de Chile', 'Gestion Integral SpA', '76.123.456-K', '987654321', 'Cuenta Corriente', 'pagos@gestion.cl'),
    ('BCI', 'Gestion Integral SpA', '76.123.456-K', '555444333', 'Cuenta Vista', 'pagos@gestion.cl'),
    ('Scotiabank', 'Gestion Integral SpA', '76.123.456-K', '111222333', 'Cuenta Corriente', 'pagos@gestion.cl'),
    ('Itau', 'Olivia Perez', '15.432.123-1', '777888999', 'Cuenta Corriente', 'olivia@eventos.cl'),
    ('Banco Ripley', 'Roberto Gomez', '12.345.678-9', '444555666', 'Cuenta Vista', 'roberto@eventos.cl'),
    ('Banco Falabella', 'Catering Express', '88.999.000-1', '222111333', 'Cuenta Corriente', 'contabilidad@catering.cl'),
    ('HSBC', 'Eventos VIP', '99.111.222-3', '666777888', 'Cuenta Corriente', 'vip@eventos.cl'),
    ('BBVA', 'Banqueteria Solar', '77.555.444-2', '333222111', 'Cuenta Corriente', 'solar@banquet.cl'),
]

for i, (banco, titular, rut, num, tipo, email) in enumerate(bancos_data):
    DatosTransferencia.objects.get_or_create(banco=banco, defaults={
        'titular': titular, 'rut': rut, 'numero_cuenta': num,
        'tipo_cuenta': tipo, 'email': email, 'activo': (i == 0)
    })
print("10 Datos de transferencia creados")

# 3. Create 15 Products
productos_data = [
    ('Lomo de Res', 'ingrediente', 'kg', 50, 10, 12000, 18000),
    ('Pollo Entero', 'ingrediente', 'kg', 80, 20, 4500, 7500),
    ('Salmon Fresco', 'ingrediente', 'kg', 30, 5, 15000, 25000),
    ('Arroz Premium', 'ingrediente', 'kg', 100, 25, 1200, 2000),
    ('Aceite de Oliva', 'ingrediente', 'lt', 40, 10, 5000, 7500),
    ('Vino Tinto Reserva', 'bebida', 'un', 60, 15, 4500, 8000),
    ('Champagne', 'bebida', 'un', 30, 10, 8000, 15000),
    ('Servilletas Premium', 'descartable', 'paquete', 200, 50, 800, 1500),
    ('Platos Desechables', 'descartable', 'paquete', 150, 40, 2500, 4000),
    ('Mantel Blanco', 'insumo', 'un', 40, 10, 5000, 8000),
    ('Bebida 2L', 'bebida', 'un', 100, 20, 1200, 2500),
    ('Pisco 750cc', 'bebida', 'un', 24, 6, 4500, 9000),
    ('Queso Mantecoso', 'ingrediente', 'kg', 15, 3, 7000, 12000),
    ('Jamon Serrano', 'ingrediente', 'kg', 10, 2, 14000, 22000),
    ('Pan de Coctel', 'ingrediente', 'un', 500, 100, 150, 400),
]

for p in productos_data:
    Producto.objects.get_or_create(nombre=p[0], defaults={
        'categoria': p[1], 'unidad': p[2], 'stock_actual': p[3],
        'stock_minimo': p[4], 'precio_compra': p[5], 'precio_venta': p[6]
    })
print("15 Productos creados")

# 4. Create 15 Events + Budgets + Collections + Payments
event_types = [t[0] for t in Evento.TIPOS]
event_states = [e[0] for e in Evento.ESTADOS]

for i in range(1, 16):
    evt_name = f"Evento Demostracion {i}"
    cliente = f"Empresa/Cliente {i}"
    fecha = date.today() + timedelta(days=random.randint(-10, 60))
    estado = random.choice(event_states)
    
    evt, created = Evento.objects.get_or_create(nombre=evt_name, defaults={
        'cliente': cliente, 'fecha': fecha, 'tipo_evento': random.choice(event_types),
        'pax': random.randint(20, 200), 'lugar': f"Lugar del Evento {i}",
        'estado': estado, 'created_by': admin_user
    })
    
    if created:
        p_estado = 'aprobado' if estado in ['confirmado', 'en_proceso', 'completado'] else 'borrador'
        pres = Presupuesto.objects.create(
            evento=evt, estado=p_estado, total=0, created_by=admin_user,
            cliente_nombre=cliente, cliente_email=f"cliente{i}@mail.com"
        )
        
        for j in range(random.randint(3, 6)):
            ItemPresupuesto.objects.create(
                presupuesto=pres, descripcion=f"Servicio/Producto {j+1}",
                cantidad=random.randint(1, 50), venta_unitario=random.randint(2000, 15000)
            )
        pres.recalcular()
        
        if estado in ['confirmado', 'en_proceso', 'completado']:
            cobro = Cobro.objects.create(presupuesto=pres, monto_total=pres.total, created_by=admin_user)
            if estado == 'completado':
                Pago.objects.create(cobro=cobro, monto=pres.total, fecha_pago=fecha, created_by=admin_user)
            else:
                Pago.objects.create(cobro=cobro, monto=pres.total / 2, fecha_pago=date.today(), created_by=admin_user)
            cobro.actualizar_estado()

print("15 Eventos, Presupuestos y Cobros creados")
print("SEED EXITOSO - Base de datos lista.")
