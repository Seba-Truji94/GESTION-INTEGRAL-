from django.test import TestCase
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from .models import Producto, MovimientoStock

class InventarioTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.producto = Producto.objects.create(
            nombre='Harina',
            categoria='ingrediente',
            unidad='kg',
            stock_actual=10,
            stock_minimo=5,
            precio_compra=800,
            precio_venta=1500
        )

    # 1. INV-AUT-01: Crear Producto
    def test_create_producto(self):
        p = Producto.objects.create(nombre='Sal', categoria='ingrediente', unidad='un', stock_actual=100)
        self.assertEqual(p.nombre, 'Sal')
        self.assertEqual(p.stock_actual, 100)

    # 2. INV-AUT-02: Entrada de Stock
    def test_entrada_stock(self):
        MovimientoStock.objects.create(producto=self.producto, tipo='entrada', cantidad=5, usuario=self.user)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, 15)

    # 3. INV-AUT-03: Salida de Stock
    def test_salida_stock(self):
        MovimientoStock.objects.create(producto=self.producto, tipo='salida', cantidad=3, usuario=self.user)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, 7)

    # 4. INV-AUT-04: Ajuste de Stock
    def test_ajuste_stock(self):
        MovimientoStock.objects.create(producto=self.producto, tipo='ajuste', cantidad=50, usuario=self.user)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, 50)

    # 5. INV-AUT-05: Alerta Stock Bajo
    def test_stock_bajo_alert(self):
        self.producto.stock_actual = 4
        self.assertTrue(self.producto.stock_bajo)
        self.producto.stock_actual = 6
        self.assertFalse(self.producto.stock_bajo)

    # 6. INV-AUT-06: Valor Inventario
    def test_valor_inventario_calc(self):
        self.assertEqual(self.producto.valor_inventario, 10 * 800)

    # 7. INV-AUT-07: Margen Producto
    def test_margen_calc(self):
        expected_margen = ((1500 - 800) / 1500) * 100
        self.assertAlmostEqual(float(self.producto.margen), expected_margen, places=2)

    # 8. INV-AUT-08: Registro Usuario
    def test_movimiento_usuario(self):
        mov = MovimientoStock.objects.create(producto=self.producto, tipo='entrada', cantidad=1, usuario=self.user)
        self.assertEqual(mov.usuario, self.user)

    # 9. INV-AUT-09: Validación Stock Negativo (Permitido por modelo pero verificado)
    def test_stock_negativo_check(self):
        MovimientoStock.objects.create(producto=self.producto, tipo='salida', cantidad=20, usuario=self.user)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock_actual, -10)

    # 10. INV-AUT-10: Endpoint Listado API
    def test_api_producto_list(self):
        response = self.client.get('/api/productos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data.get('results', response.data)), 1)
