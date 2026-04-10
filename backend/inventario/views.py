from rest_framework import generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Producto, MovimientoStock
from .serializers import ProductoSerializer, MovimientoSerializer


class ProductoListCreateView(generics.ListCreateAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'proveedor', 'categoria']
    ordering_fields = ['nombre', 'stock_actual', 'precio_compra', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        cat = self.request.query_params.get('categoria')
        bajo = self.request.query_params.get('stock_bajo')
        activo = self.request.query_params.get('activo')
        if cat:
            qs = qs.filter(categoria=cat)
        if bajo == 'true':
            qs = [p for p in qs if p.stock_bajo]
            return qs
        if activo is not None:
            qs = qs.filter(activo=activo == 'true')
        return qs


class ProductoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer


class MovimientoListCreateView(generics.ListCreateAPIView):
    queryset = MovimientoStock.objects.select_related('producto', 'usuario').all()
    serializer_class = MovimientoSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['fecha']

    def get_queryset(self):
        qs = super().get_queryset()
        producto_id = self.request.query_params.get('producto')
        tipo = self.request.query_params.get('tipo')
        if producto_id:
            qs = qs.filter(producto_id=producto_id)
        if tipo:
            qs = qs.filter(tipo=tipo)
        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class ProductoAlertasView(APIView):
    """Return products with low stock."""
    def get(self, request):
        productos = Producto.objects.filter(activo=True)
        alertas = [ProductoSerializer(p).data for p in productos if p.stock_bajo]
        return Response(alertas)
