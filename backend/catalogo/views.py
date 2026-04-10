from rest_framework import viewsets, permissions
from .models import ProductoCatalogo, RecetaItem
from .serializers import ProductoCatalogoSerializer, RecetaItemSerializer

class ProductoCatalogoViewSet(viewsets.ModelViewSet):
    queryset = ProductoCatalogo.objects.all()
    serializer_class = ProductoCatalogoSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        cat = self.request.query_params.get('categoria')
        if cat:
            qs = qs.filter(categoria=cat)
        return qs

class RecetaItemViewSet(viewsets.ModelViewSet):
    queryset = RecetaItem.objects.all()
    serializer_class = RecetaItemSerializer
    permission_classes = [permissions.IsAuthenticated]
