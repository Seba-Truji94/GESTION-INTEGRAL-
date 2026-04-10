from django.test import TestCase
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from decimal import Decimal
from inventario.models import Producto
from catalogo.models import ProductoCatalogo, RecetaItem

class CatalogoTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.ingrediente = Producto.objects.create(
            nombre='Harina',
            precio_compra=800,
            stock_actual=10,
            unidad='kg'
        )
        self.producto = ProductoCatalogo.objects.create(
            nombre='Torta Base',
            categoria='reposteria',
            precio_venta=15000
        )

    # 1. CAT-AUT-01: Crear Producto Catálogo
    def test_create_catalogo_product(self):
        self.assertEqual(self.producto.nombre, 'Torta Base')
        self.assertTrue(self.producto.activo)

    # 2. CAT-AUT-02: Receta: Agregar Insumo
    def test_receta_item_add(self):
        ri = RecetaItem.objects.create(
            producto_catalogo=self.producto,
            producto=self.ingrediente,
            cantidad=Decimal('0.5')
        )
        self.assertEqual(ri.producto_catalogo, self.producto)

    # 3. CAT-AUT-03: Calculo Costo Base
    def test_costo_base_calc(self):
        RecetaItem.objects.create(
            producto_catalogo=self.producto,
            producto=self.ingrediente,
            cantidad=Decimal('0.5')
        )
        # 800 * 0.5 = 400
        self.assertEqual(self.producto.costo_base, 400)

    # 4. CAT-AUT-04: Margen Estimado
    def test_margen_estimado_calc(self):
        RecetaItem.objects.create(
            producto_catalogo=self.producto,
            producto=self.ingrediente,
            cantidad=Decimal('0.5')
        )
        # (15000 - 400) / 15000 = 97.33%
        expected = Decimal((15000 - 400) / 15000) * 100
        self.assertAlmostEqual(Decimal(str(self.producto.margen_estimado)), Decimal(str(expected)), places=2)

    # 5. CAT-AUT-05: Integridad: Borrado (PROTECT)
    def test_protect_ingredient_delete(self):
        RecetaItem.objects.create(
            producto_catalogo=self.producto,
            producto=self.ingrediente,
            cantidad=1
        )
        from django.db.models.deletion import ProtectedError
        with self.assertRaises(ProtectedError):
            self.ingrediente.delete()

    # 6. CAT-AUT-06: API Listado
    def test_api_catalogo_list(self):
        response = self.client.get('/api/catalogo/productos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify it's a list (pagination is disabled in this viewset)
        self.assertGreaterEqual(len(response.data), 1)

    # 7. CAT-AUT-07: Filtro Categoría API
    def test_api_filter_categoria(self):
        response = self.client.get('/api/catalogo/productos/?categoria=reposteria')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    # 8. CAT-AUT-08: Múltiples Ingredientes
    def test_receta_multiple_items(self):
        i2 = Producto.objects.create(nombre='Huevo', precio_compra=100, stock_actual=10)
        RecetaItem.objects.create(producto_catalogo=self.producto, producto=self.ingrediente, cantidad=1)
        RecetaItem.objects.create(producto_catalogo=self.producto, producto=i2, cantidad=5)
        # (800*1) + (100*5) = 1300
        self.assertEqual(self.producto.costo_base, 1300)

    # 9. CAT-AUT-09: Descripción Larga
    def test_catalogo_desc(self):
        self.producto.descripcion = "Torta hecha con harina premium y huevos de campo."
        self.producto.save()
        self.assertEqual(ProductoCatalogo.objects.get(id=self.producto.id).descripcion, self.producto.descripcion)

    # 10. CAT-AUT-10: Sincronización API Create
    def test_api_create_catalogo(self):
        response = self.client.post('/api/catalogo/productos/', {
            'nombre': 'Combo Fiesta',
            'categoria': 'cocteleria',
            'precio_venta': 50000,
            'ingredientes': []
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
