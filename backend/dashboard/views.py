from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from eventos.models import Evento, Presupuesto
from cobros.models import Cobro, Pago
from inventario.models import Producto
from gastos.models import GastoFijo
from django.db.models.functions import ExtractMonth, ExtractYear


class DashboardView(APIView):
    """Main dashboard with all KPIs and metrics."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Date filters
        anio = request.query_params.get('anio', timezone.now().year)
        mes = request.query_params.get('mes')

        eventos_qs = Evento.objects.filter(fecha__year=anio)
        presupuestos_qs = Presupuesto.objects.filter(evento__fecha__year=anio)
        cobros_qs = Cobro.objects.filter(presupuesto__evento__fecha__year=anio)

        if mes:
            eventos_qs = eventos_qs.filter(fecha__month=int(mes))
            presupuestos_qs = presupuestos_qs.filter(evento__fecha__month=int(mes))
            cobros_qs = cobros_qs.filter(presupuesto__evento__fecha__month=int(mes))

        # Ventas y costos
        ventas_totales = 0
        costos_totales = 0
        for pres in presupuestos_qs.prefetch_related('items'):
            ventas_totales += float(pres.total or 0)
            costos_totales += sum(float(i.cantidad * i.costo_unitario) for i in pres.items.all())

        utilidad = ventas_totales - costos_totales
        margen_promedio = (utilidad / ventas_totales * 100) if ventas_totales > 0 else 0

        # Eventos por estado
        eventos_por_estado = {}
        for estado_key, estado_label in Evento.ESTADOS:
            count = eventos_qs.filter(estado=estado_key).count()
            eventos_por_estado[estado_key] = {'label': estado_label, 'count': count}

        # Cobros por estado
        cobros_por_estado = {}
        for estado_key, estado_label in Cobro.ESTADOS:
            count = cobros_qs.filter(estado=estado_key).count()
            cobros_por_estado[estado_key] = {'label': estado_label, 'count': count}

        # Total pagado vs pendiente
        total_cobrado = float(cobros_qs.aggregate(t=Sum('monto_total'))['t'] or 0)
        pagos = Pago.objects.filter(cobro__in=cobros_qs)
        total_pagado = float(pagos.aggregate(t=Sum('monto'))['t'] or 0)
        total_pendiente = total_cobrado - total_pagado

        # Ventas por mes
        ventas_por_mes = []
        meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        for m in range(1, 13):
            pres_mes = Presupuesto.objects.filter(evento__fecha__year=anio, evento__fecha__month=m)
            v_mes = sum(float(p.total or 0) for p in pres_mes)
            c_mes = 0
            for p in pres_mes.prefetch_related('items'):
                c_mes += sum(float(i.cantidad * i.costo_unitario) for i in p.items.all())
            ventas_por_mes.append({
                'mes': meses[m - 1],
                'mes_num': m,
                'ventas': v_mes,
                'costos': c_mes,
                'utilidad': v_mes - c_mes,
            })

        # Próximos eventos
        proximos = Evento.objects.filter(
            fecha__gte=timezone.now().date(),
            estado__in=['presupuestado', 'confirmado', 'en_proceso']
        ).order_by('fecha')[:5]
        proximos_data = [{
            'id': e.id, 'nombre': e.nombre, 'cliente': e.cliente,
            'fecha': e.fecha.strftime('%d/%m/%Y'), 'estado': e.get_estado_display(),
            'pax': e.pax, 'tipo': e.get_tipo_evento_display()
        } for e in proximos]

        # Stock bajo
        productos = Producto.objects.filter(activo=True)
        stock_bajo = [{'id': p.id, 'nombre': p.nombre, 'stock_actual': float(p.stock_actual),
                       'stock_minimo': float(p.stock_minimo), 'unidad': p.unidad}
                      for p in productos if p.stock_bajo and p.stock_minimo > 0]

        # Totales de inventario
        valor_inventario = sum(float(p.valor_inventario) for p in productos)
        total_productos = productos.count()

        # Gastos totales del año
        gastos_qs = GastoFijo.objects.filter(anio=anio)
        if mes:
            gastos_qs = gastos_qs.filter(mes=int(mes))
        total_gastos = float(gastos_qs.aggregate(t=Sum('monto'))['t'] or 0)

        # Cobros Pendientes (Top 5)
        cobros_pendientes_qs = Cobro.objects.filter(estado__in=['pendiente', 'parcial'])
        if anio:
            cobros_pendientes_qs = cobros_pendientes_qs.filter(presupuesto__evento__fecha__year=anio)
        if mes:
            cobros_pendientes_qs = cobros_pendientes_qs.filter(presupuesto__evento__fecha__month=int(mes))
        
        cobros_pendientes_data = []
        for c in cobros_pendientes_qs.order_by('fecha_vencimiento')[:5]:
            fv = c.fecha_vencimiento
            cobros_pendientes_data.append({
                'id': c.id,
                'cliente': c.presupuesto.evento.cliente,
                'evento': c.presupuesto.evento.nombre,
                'monto_total': float(c.monto_total),
                'pendiente': float(c.saldo_pendiente),
                'vencimiento': fv.strftime('%d/%m/%Y') if fv else 'Sin fecha'
            })

        # Top Insumos / Productos por valor
        from eventos.models import ItemPresupuesto
        insumos_raw = ItemPresupuesto.objects.filter(
            presupuesto__estado__in=['aprobado', 'completado'],
            presupuesto__evento__fecha__year=anio
        )
        if mes:
            insumos_raw = insumos_raw.filter(presupuesto__evento__fecha__month=int(mes))
            
        consumo_data = {}
        for item in insumos_raw:
            key = item.descripcion
            if key not in consumo_data:
                consumo_data[key] = {'nombre': key, 'cantidad': 0, 'valor_total': 0}
            consumo_data[key]['cantidad'] += float(item.cantidad)
            consumo_data[key]['valor_total'] += float(item.cantidad * item.costo_unitario)
            
        top_insumos = sorted(consumo_data.values(), key=lambda x: x['valor_total'], reverse=True)[:5]
        
        # Top Clientes
        clientes_data = {}
        for pres in presupuestos_qs.filter(estado__in=['aprobado', 'completado']).select_related('evento'):
            cli = pres.evento.cliente or 'Particular'
            if cli not in clientes_data:
                clientes_data[cli] = {'nombre': cli, 'total_comprado': 0, 'eventos': 0}
            clientes_data[cli]['total_comprado'] += float(pres.total or 0)
            clientes_data[cli]['eventos'] += 1
            
        top_clientes = sorted(clientes_data.values(), key=lambda x: x['total_comprado'], reverse=True)[:5]

        return Response({
            'ventas_totales': ventas_totales,
            'costos_totales': costos_totales,
            'utilidad': utilidad,
            'margen_promedio': round(margen_promedio, 1),
            'total_eventos': eventos_qs.count(),
            'eventos_por_estado': eventos_por_estado,
            'cobros_por_estado': cobros_por_estado,
            'total_cobrado': total_cobrado,
            'total_pagado': total_pagado,
            'total_pendiente': total_pendiente,
            'ventas_por_mes': ventas_por_mes,
            'proximos_eventos': proximos_data,
            'stock_bajo': stock_bajo,
            'valor_inventario': valor_inventario,
            'total_productos': total_productos,
            'total_gastos': total_gastos,
            'cobros_pendientes': cobros_pendientes_data,
            'top_insumos': top_insumos,
            'top_clientes': top_clientes,
            'anio': int(anio),
        })


class ReportesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        anio = int(request.query_params.get('anio', timezone.now().year))
        mes = request.query_params.get('mes')
        
        # 1. Rentabilidad de Eventos (Approved or Completed)
        eventos_raw = Evento.objects.filter(fecha__year=anio)
        if mes:
            eventos_raw = eventos_raw.filter(fecha__month=int(mes))
            
        rentabilidad_data = []
        for e in eventos_raw.order_by('-fecha'):
            # Get approved budgets
            pres_aprobados = e.presupuestos.filter(estado__in=['aprobado', 'completado'])
            v_total = sum(p.total for p in pres_aprobados)
            c_total = 0
            for p in pres_aprobados.prefetch_related('items'):
                c_total += sum(i.cantidad * i.costo_unitario for i in p.items.all())
                
            # Payment status
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
                'cliente': e.cliente if e.cliente else 'Particular',
                'fecha': e.fecha,
                'estado': e.estado,
                'pax': e.pax,
                'venta': float(v_total),
                'costo': float(c_total),
                'utilidad': float(v_total - c_total),
                'margen': float((v_total - c_total) / v_total * 100) if v_total > 0 else 0,
                'pagado': float(pagos_total),
                'pendiente': float(total_cobrado - pagos_total),
                'historial_pagos': pagos_detalle
            })

        # 2. Flujo de Caja Mensual (Pagos vs Gastos Fijos)
        flujo_data = []
        meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        
        for m in range(1, 13):
            # Pagos recibidos este mes
            ingresos_mes = Pago.objects.filter(fecha_pago__year=anio, fecha_pago__month=m).aggregate(Sum('monto'))['monto__sum'] or 0
            # Gastos fijos vencidos/pagados este mes
            gastos_mes = GastoFijo.objects.filter(anio=anio, mes=m).aggregate(Sum('monto'))['monto__sum'] or 0
            
            flujo_data.append({
                'mes_num': m,
                'mes_label': meses[m-1],
                'ingresos': float(ingresos_mes),
                'gastos': float(gastos_mes),
                'flujo_neto': float(ingresos_mes - gastos_mes)
            })

        # 3. Consumo de Insumos (Ranked by usage)
        from eventos.models import ItemPresupuesto
        insumos_raw = ItemPresupuesto.objects.filter(
            presupuesto__estado__in=['aprobado', 'completado'],
            presupuesto__evento__fecha__year=anio
        )
        if mes:
            insumos_raw = insumos_raw.filter(presupuesto__evento__fecha__month=int(mes))
            
        consumo_data = {}
        for item in insumos_raw:
            key = item.descripcion
            if key not in consumo_data:
                consumo_data[key] = {'nombre': key, 'cantidad': 0, 'unidad': item.categoria, 'costo_total': 0}
            consumo_data[key]['cantidad'] += float(item.cantidad)
            consumo_data[key]['costo_total'] += float(item.cantidad * item.costo_unitario)

        sorted_consumo = sorted(consumo_data.values(), key=lambda x: x['cantidad'], reverse=True)[:20]

        return Response({
            'rentabilidad': rentabilidad_data,
            'flujo_caja': flujo_data,
            'consumo': sorted_consumo,
            'anio': anio,
            'mes': mes
        })
