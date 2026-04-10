import os
import django
import sys
from django.utils import timezone
from django.db.models import Sum

# Setup django environment
sys.path.append('c:\\Users\\cuent\\Downloads\\BAQUETERIA\\GESTION_INTEGRAL\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from eventos.models import Evento, Presupuesto, ItemPresupuesto
from cobros.models import Cobro, Pago
from inventario.models import Producto
from gastos.models import GastoFijo

def test_reportes_view():
    anio = 2026
    mes = None
    
    print(f"Testing Reportes logic for year {anio}...")
    
    try:
        # 1. Rentabilidad
        eventos_raw = Evento.objects.filter(fecha__year=anio).select_related('cliente')
        rentabilidad_data = []
        for e in eventos_raw.order_by('-fecha'):
            pres_aprobados = e.presupuestos.filter(estado__in=['aprobado', 'completado'])
            v_total = sum(p.total for p in pres_aprobados)
            c_total = 0
            for p in pres_aprobados.prefetch_related('items'):
                # Potential crash here if items is empty or quantity/cost is None
                c_total += sum(i.cantidad * i.costo_unitario for i in p.items.all())
                
            cobros = Cobro.objects.filter(presupuesto__in=pres_aprobados)
            total_cobrado = cobros.aggregate(Sum('monto_total'))['monto_total__sum'] or 0
            
            pagos_qs = Pago.objects.filter(cobro__in=cobros).order_by('fecha_pago')
            pagos_total = pagos_qs.aggregate(Sum('monto'))['monto__sum'] or 0
            
            pagos_detalle = [{
                'id': p.id,
                'monto': float(p.monto),
                'fecha': p.fecha_pago,
                'metodo': p.get_metodo_pago_display()
            } for p in pagos_qs]
            
            rentabilidad_data.append({
                'id': e.id,
                'nombre': e.nombre,
                'cliente': e.cliente.nombre if e.cliente else 'Particular',
                'venta': float(v_total),
                'costo': float(c_total),
                'historial_pagos': pagos_detalle
            })
        print(f"Rentabilidad processed: {len(rentabilidad_data)} records")

        # 2. Flujo de Caja
        flujo_data = []
        for m in range(1, 13):
            ingresos_mes = Pago.objects.filter(fecha__year=anio, fecha__month=m).aggregate(Sum('monto'))['monto__sum'] or 0
            # Check GastoFijo query - Wait, I use mes and anio fields there
            gastos_mes = GastoFijo.objects.filter(anio=anio, mes=m).aggregate(Sum('monto'))['monto__sum'] or 0
            flujo_data.append({
                'mes_num': m,
                'ingresos': float(ingresos_mes),
                'gastos': float(gastos_mes)
            })
        print("Flujo de caja processed.")

        # 3. Consumo Insumos
        insumos_raw = ItemPresupuesto.objects.filter(
            presupuesto__estado__in=['aprobado', 'completado'],
            presupuesto__evento__fecha__year=anio
        )
        consumo_data = {}
        for item in insumos_raw:
            key = item.descripcion
            if key not in consumo_data:
                consumo_data[key] = {'nombre': key, 'cantidad': 0, 'unidad': item.categoria, 'costo_total': 0}
            consumo_data[key]['cantidad'] += float(item.cantidad)
            consumo_data[key]['costo_total'] += float(item.cantidad * item.costo_unitario)
        print(f"Consumo insumos processed: {len(consumo_data)} items")
        
        print("✅ FULL SUCCESS")
        
    except Exception as e:
        import traceback
        print(f"❌ CRASH: {str(e)}")
        traceback.print_exc()

if __name__ == '__main__':
    test_reportes_view()
