from django.test import TestCase
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from gastos.models import GastoFijo

class GastosTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.fecha = timezone.now().date()
        self.gasto = GastoFijo.objects.create(
            nombre='Arriendo Bodega',
            categoria='arriendo',
            monto=500000,
            fecha_vencimiento=self.fecha,
            created_by=self.user
        )

    # 1. GST-AUT-01: Crear Gasto Fijo
    def test_create_gasto(self):
        self.assertEqual(self.gasto.nombre, 'Arriendo Bodega')
        self.assertEqual(self.gasto.estado, 'pendiente')

    # 2. GST-AUT-02: Auto-llenado Mes/Año
    def test_auto_periodo(self):
        self.assertEqual(self.gasto.mes, self.fecha.month)
        self.assertEqual(self.gasto.anio, self.fecha.year)

    # 3. GST-AUT-03: Cambio de Estado
    def test_estado_transition(self):
        self.gasto.estado = 'pagado'
        self.gasto.save()
        self.assertEqual(GastoFijo.objects.get(id=self.gasto.id).estado, 'pagado')

    # 4. GST-AUT-03: Filtro por Periodo API
    def test_api_filter_periodo(self):
        response = self.client.get(f'/api/gastos/?mes={self.fecha.month}&anio={self.fecha.year}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # GastoFijoViewSet has pagination_class = None
        self.assertEqual(len(response.data), 1)

    # 5. GST-AUT-04: Gasto Total API (Cálculo implícito en listado)
    def test_api_gasto_list(self):
        response = self.client.get('/api/gastos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    # 6. GST-AUT-06: Clonar Mes Anterior (Acción Especial)
    def test_clonar_mes_anterior(self):
        # Create a gasto for the previous month
        mes_prev = self.fecha.month - 1
        anio_prev = self.fecha.year
        if mes_prev == 0:
            mes_prev = 12
            anio_prev -= 1
        
        GastoFijo.objects.create(
            nombre='Luz',
            categoria='servicios',
            monto=30000,
            fecha_vencimiento=timezone.now().date(),
            mes=mes_prev,
            anio=anio_prev,
            created_by=self.user
        )
        
        response = self.client.post('/api/gastos/clonar-mes-anterior/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['clonados'], 1)
        self.assertTrue(GastoFijo.objects.filter(nombre='Luz', mes=self.fecha.month).exists())

    # 7. GST-AUT-07: Categorías Válidas
    def test_gasto_categoria(self):
        g = GastoFijo.objects.create(nombre='Sueldo Pepe', categoria='sueldos', monto=1000, fecha_vencimiento=self.fecha)
        self.assertEqual(g.categoria, 'sueldos')

    # 8. GST-AUT-08: Observaciones Opcionales
    def test_gasto_no_obs(self):
        g = GastoFijo.objects.create(nombre='Sin obs', monto=10, fecha_vencimiento=self.fecha)
        self.assertEqual(g.observaciones, '')

    # 9. GST-AUT-08: Permisos API
    def test_api_unauthorized(self):
        self.client.logout()
        response = self.client.get('/api/gastos/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 10. GST-AUT-10: Borrado de Gasto
    def test_delete_gasto(self):
        res = self.client.delete(f'/api/gastos/{self.gasto.id}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(GastoFijo.objects.filter(id=self.gasto.id).exists())
