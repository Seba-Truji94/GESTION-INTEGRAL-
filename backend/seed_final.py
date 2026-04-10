import os
import django
import random
from datetime import date, timedelta
from decimal import Decimal

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from eventos.models import Evento, Presupuesto, ItemPresupuesto
from cobros.models import Cobro, Pago, DatosTransferencia, SeguimientoEvento
from inventario.models import Producto, MovimientoStock
from gastos.models import GastoFijo
from catalogo.models import ProductoCatalogo, RecetaItem

Usuario = get_user_model()

def clear_data():
    print("Limpiando datos previos...")
    Pago.objects.all().delete()
    Cobro.objects.all().delete()
    ItemPresupuesto.objects.all().delete()
    Presupuesto.objects.all().delete()
    SeguimientoEvento.objects.all().delete()
    Evento.objects.all().delete()
    GastoFijo.objects.all().delete()
    RecetaItem.objects.all().delete()
    ProductoCatalogo.objects.all().delete()
    MovimientoStock.objects.all().delete()
    Producto.objects.all().delete()
    DatosTransferencia.objects.all().delete()
    # Keep the main admin if exists, delete others
    Usuario.objects.exclude(username='admin').delete()

def seed():
    # 1. Users (1 admin exists, create 9 more)
    print("Poblando Usuarios...")
    roles = ['admin', 'operador', 'operador', 'operador', 'admin', 'operador', 'operador', 'operador', 'operador']
    names = [
        ('Seba', 'Trujillo'), ('Carlos', 'Perez'), ('Ana', 'Maria'), 
        ('Lucia', 'Fernandez'), ('Roberto', 'Gomez'), ('Elena', 'Soto'),
        ('Pedro', 'Duran'), ('Marta', 'Sanchez'), ('Diego', 'Lopez')
    ]
    
    admin_user, _ = Usuario.objects.get_or_create(username='admin', defaults={
        'first_name': 'Admin', 'last_name': 'Kruxel', 'rol': 'admin', 'is_staff': True, 'is_superuser': True
    })
    
    users = [admin_user]
    for i in range(len(names)):
        username = f"user_{i+1}"
        fn, ln = names[i]
        role = roles[i]
        u, created = Usuario.objects.get_or_create(username=username, defaults={
            'email': f"{username}@kruxel.cl",
            'first_name': fn,
            'last_name': ln,
            'rol': role,
            'is_staff': (role == 'admin')
        })
        if created:
            u.set_password('kruxel123')
            u.save()
        users.append(u)

    # 2. Bank Details
    print("Poblando Datos Bancarios...")
    bancos = ['Santander', 'Banco Estado', 'BCI', 'Itaú', 'Scotiabank', 'Chile', 'Ripley', 'Falabella', 'Security', 'Bice']
    for b in bancos:
        DatosTransferencia.objects.create(
            banco=b,
            titular='Kruxel Gestión Integral',
            rut='76.543.210-K',
            numero_cuenta=str(random.randint(100000000, 999999999)),
            tipo_cuenta='Cuenta Corriente',
            email='pagos@kruxel.cl',
            activo=(b == 'Santander')
        )

    # 3. Inventory
    print("Poblando Inventario...")
    productos_data = [
        ('Harina de Trigo', 'ingrediente', 'kg', 100, 20, 800, 0),
        ('Azúcar granulada', 'ingrediente', 'kg', 50, 10, 1100, 0),
        ('Huevos de Campo', 'ingrediente', 'bandeja', 30, 5, 6500, 0),
        ('Mantequilla', 'ingrediente', 'kg', 20, 4, 7500, 0),
        ('Salmón Premium', 'ingrediente', 'kg', 15, 3, 16000, 25000),
        ('Lomo Liso', 'ingrediente', 'kg', 25, 5, 12500, 22000),
        ('Vino Tinto Reserva', 'bebida', 'un', 48, 12, 4500, 12000),
        ('Bebida 1.5L', 'bebida', 'un', 120, 24, 1200, 3000),
        ('Servilletas coctel', 'descartable', 'paquete', 100, 10, 1500, 0),
        ('Vasos Desechables', 'descartable', 'paquete', 80, 10, 2200, 0),
        ('Arroz Grado 1', 'ingrediente', 'kg', 60, 15, 1100, 0),
        ('Aceite vegetal', 'ingrediente', 'lt', 40, 8, 2500, 0),
        ('Pisco 35°', 'bebida', 'un', 24, 6, 5500, 15000),
        ('Champagne Brut', 'bebida', 'un', 36, 6, 8500, 25000),
        ('Carbón 5kg', 'insumo', 'bolsa', 20, 5, 4500, 0)
    ]
    inventory_items = []
    for name, cat, unit, stock, min_s, p_c, p_v in productos_data:
        p = Producto.objects.create(
            nombre=name, categoria=cat, unidad=unit, stock_actual=stock,
            stock_minimo=min_s, precio_compra=p_c, precio_venta=p_v
        )
        inventory_items.append(p)

    # 4. Catalog
    print("Poblando Catálogo...")
    catalog_data = [
        ('Torta de Novios Clásica', 'reposteria', 85000, 'Torta de 3 pisos con crema diplomata y frutas.'),
        ('Cena 3 Tiempos Premium', 'banqueteria', 45000, 'Entrada, fondo y postre con servicio incluido.'),
        ('Cocktail Básico (50 pax)', 'cocteleria', 150000, 'Variedad de bocados fríos y calientes.'),
        ('Finger Food Tradicional', 'cocteleria', 12000, 'Mini empanadas, quiches y brochetas.'),
        ('Pack Bebidas Ilimitadas', 'bebidas', 8000, 'Barra libre de gaseosas y jugos por persona.'),
        ('Almuerzo Corporativo', 'banqueteria', 25000, 'Menú balanceado para eventos de empresa.'),
        ('Buffet de Postres', 'reposteria', 18000, 'Mesa de dulces variados.'),
        ('Barra de Tragos Nacionales', 'bebidas', 15000, 'Pisco, ron y bebidas incluidas.'),
        ('Coffee Break Matinal', 'banqueteria', 9500, 'Café, té, galletas y mini sandwiches.'),
        ('Torta Manjar Nuez', 'reposteria', 25000, 'Torta casera para 20 personas.')
    ]
    catalog_items = []
    for name, cat, price, desc in catalog_data:
        pc = ProductoCatalogo.objects.create(
            nombre=name, categoria=cat, precio_venta=price, descripcion=desc
        )
        # Add random recipes
        for _ in range(3):
            ing = random.choice(inventory_items)
            RecetaItem.objects.create(
                producto_catalogo=pc,
                producto=ing,
                cantidad=Decimal(random.uniform(0.1, 2.0)).quantize(Decimal('0.001'))
            )
        catalog_items.append(pc)

    # 5. Fixed Expenses
    print("Poblando Gastos...")
    gastos_names = [
        ('Arriendo Bodega Maipú', 'arriendo', 850000),
        ('Cuenta Luz Enel', 'servicios', 120000),
        ('Cuenta Agua Aguas Andinas', 'servicios', 45000),
        ('Sueldo Administrativo', 'sueldos', 650000),
        ('Sueldo Operador 1', 'sueldos', 550000),
        ('Sueldo Operador 2', 'sueldos', 550000),
        ('ERP Mensualidad', 'suscripciones', 45000),
        ('Internet Fibra Movistar', 'servicios', 35000),
        ('Seguro Local Mapfre', 'seguros', 95000),
        ('Publicidad Facebook Ads', 'marketing', 150000),
        ('Mantenimiento Camión', 'mantenimiento', 250000),
        ('Insumos de Limpieza', 'insumos_fijos', 60000),
        ('Papelería y Oficina', 'insumos_fijos', 25000),
        ('Renovación Patente', 'seguros', 180000),
        ('Gasto Común Oficinas', 'arriendo', 85000)
    ]
    ahora = date.today()
    for i, (name, cat, amount) in enumerate(gastos_names):
        # Distributed in last 2 months
        rel_date = ahora - timedelta(days=random.randint(0, 45))
        GastoFijo.objects.create(
            nombre=name, categoria=cat, monto=amount, 
            fecha_vencimiento=rel_date,
            estado=random.choice(['pendiente', 'pagado']),
            created_by=admin_user
        )

    # 6. Events, Budgets, Collections
    print("Poblando Eventos y Finanzas...")
    tipos_evento = [t[0] for t in Evento.TIPOS]
    estados_evento = [e[0] for e in Evento.ESTADOS]
    
    for i in range(15):
        evt_date = ahora + timedelta(days=random.randint(-15, 60))
        estado = random.choice(estados_evento)
        user = random.choice(users)
        
        evt = Evento.objects.create(
            nombre=f"Evento Especial {i+1}",
            cliente=f"Cliente VIP {i+1}",
            fecha=evt_date,
            tipo_evento=random.choice(tipos_evento),
            pax=random.randint(20, 250),
            lugar=f"Centro de Eventos Calle {random.randint(100, 9999)}",
            estado=estado,
            created_by=user
        )
        
        # Create budget
        b_estado = 'aprobado' if estado in ['confirmado', 'en_proceso', 'completado'] else 'borrador'
        pres = Presupuesto.objects.create(
            evento=evt,
            estado=b_estado,
            cliente_nombre=evt.cliente,
            cliente_email=f"cliente{i+1}@ejemplo.cl",
            created_by=user,
            incluir_iva=True
        )
        
        # Add items to budget
        total = 0
        # Add one catalog item
        cat_item = random.choice(catalog_items)
        qty = random.randint(1, 5)
        it = ItemPresupuesto.objects.create(
            presupuesto=pres,
            producto_catalogo=cat_item,
            descripcion=cat_item.nombre,
            cantidad=qty,
            venta_unitario=cat_item.precio_venta
        )
        
        # Add some custom items
        for j in range(2):
            price = random.randint(5000, 50000)
            qty_c = random.randint(10, 100)
            ItemPresupuesto.objects.create(
                presupuesto=pres,
                descripcion=f"Servicio Adicional {j+1}",
                cantidad=qty_c,
                venta_unitario=price
            )
        
        pres.recalcular()
        
        # Create collections and payments if applicable
        if b_estado == 'aprobado':
            cobro = Cobro.objects.create(
                presupuesto=pres,
                monto_total=pres.total,
                fecha_vencimiento=evt.fecha - timedelta(days=7),
                created_by=user
            )
            
            p_status = random.choice(['nadie', 'parcial', 'pagado'])
            if p_status == 'pagado':
                Pago.objects.create(
                    cobro=cobro, monto=pres.total, 
                    fecha_pago=date.today(), metodo_pago='transferencia',
                    created_by=user
                )
            elif p_status == 'parcial':
                Pago.objects.create(
                    cobro=cobro, monto=pres.total / 2, 
                    fecha_pago=date.today(), metodo_pago='transferencia',
                    created_by=user
                )
            cobro.actualizar_estado()

            # Create some follow-up tracking
            SeguimientoEvento.objects.create(
                evento=evt,
                estado_anterior='borrador',
                estado_nuevo=estado,
                notas='Auto-generado por el sistema de poblamiento.',
                usuario=user
            )

    print("\n--- POBLAMIENTO FINALIZADO CON ÉXITO ---")
    print(f"Usuarios: {Usuario.objects.count()}")
    print(f"Productos: {Producto.objects.count()}")
    print(f"Catálogo: {ProductoCatalogo.objects.count()}")
    print(f"Gastos: {GastoFijo.objects.count()}")
    print(f"Eventos: {Evento.objects.count()}")
    print(f"Presupuestos: {Presupuesto.objects.count()}")
    print(f"Cobros: {Cobro.objects.count()}")

if __name__ == "__main__":
    import sys
    if "--clear" in sys.argv:
        clear_data()
    seed()
