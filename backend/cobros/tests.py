from django.test import TestCase
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from decimal import Decimal
from eventos.models import Evento, Presupuesto
from cobros.models import Cobro, Pago, SeguimientoEvento, DatosTransferencia

class CobrosTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.evento = Evento.objects.create(
            nombre='Evento Test',
            cliente='Cliente Test',
            fecha=timezone.now().date(),
            pax=10,
            created_by=self.user
        )
        self.presupuesto = Presupuesto.objects.create(
            evento=self.evento,
            total=100000,
            created_by=self.user
        )
        self.cobro = Cobro.objects.create(
            presupuesto=self.presupuesto,
            monto_total=100000,
            created_by=self.user
        )

    # 1. FIN-AUT-01: Crear Cobro
    def test_create_cobro(self):
        self.assertEqual(self.cobro.monto_total, 100000)
        self.assertEqual(self.cobro.estado, 'pendiente')

    # 2. FIN-AUT-02: Registrar Pago
    def test_pago_registration(self):
        pago = Pago.objects.create(
            cobro=self.cobro,
            monto=50000,
            fecha_pago=timezone.now().date(),
            metodo_pago='transferencia',
            created_by=self.user
        )
        self.assertEqual(self.cobro.pagos.count(), 1)
        self.assertEqual(pago.monto, 50000)

    # 3. FIN-AUT-03: Actualizar Estado Parcial
    def test_update_estado_parcial(self):
        Pago.objects.create(cobro=self.cobro, monto=30000, fecha_pago=timezone.now().date())
        self.cobro.actualizar_estado()
        self.assertEqual(self.cobro.estado, 'parcial')

    # 4. FIN-AUT-04: Pago Completo
    def test_update_estado_pagado(self):
        Pago.objects.create(cobro=self.cobro, monto=100000, fecha_pago=timezone.now().date())
        self.cobro.actualizar_estado()
        self.assertEqual(self.cobro.estado, 'pagado')

    # 5. FIN-AUT-05: Saldo Pendiente
    def test_saldo_pendiente_calc(self):
        Pago.objects.create(cobro=self.cobro, monto=40000, fecha_pago=timezone.now().date())
        self.assertEqual(self.cobro.saldo_pendiente, 60000)

    # 6. FIN-AUT-06: API Listado Cobros
    def test_api_cobro_list(self):
        response = self.client.get('/api/cobros/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data)
        self.assertGreaterEqual(len(data), 1)

    # 7. FIN-AUT-07: API Registro Pago Recalcula
    def test_api_pago_create_recalculates(self):
        response = self.client.post(f'/api/cobros/{self.cobro.id}/pagos/', {
            'monto': 100000,
            'fecha_pago': str(timezone.now().date()),
            'metodo_pago': 'transferencia'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.cobro.refresh_from_db()
        self.assertEqual(self.cobro.estado, 'pagado')

    # 8. FIN-AUT-08: Datos Transferencia Públicos
    def test_api_datos_bancarios_public(self):
        DatosTransferencia.objects.create(banco='BCI', titular='Kruxel', rut='1-9', numero_cuenta='123', tipo_cuenta='Corriente', email='t@t.cl')
        self.client.logout()
        response = self.client.get('/api/datos-transferencia/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    # 9. FIN-AUT-09: Seguimiento Evento API
    def test_api_seguimiento_create(self):
        response = self.client.post(f'/api/eventos/{self.evento.id}/seguimiento/crear/', {
            'estado_nuevo': 'confirmado',
            'notas': 'Cliente confirmó vía telefónica'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.evento.refresh_from_db()
        self.assertEqual(self.evento.estado, 'confirmado')
        self.assertTrue(SeguimientoEvento.objects.filter(evento=self.evento, estado_nuevo='confirmado').exists())

    def test_api_seguimiento_list(self):
        SeguimientoEvento.objects.create(evento=self.evento, estado_anterior='presupuestado', estado_nuevo='confirmado', usuario=self.user)
        response = self.client.get(f'/api/eventos/{self.evento.id}/seguimiento/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should be at least 1, allowing for existing traces in some environments
        self.assertGreaterEqual(len(response.data), 1)
