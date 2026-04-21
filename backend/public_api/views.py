from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from catalogo.models import ProductoCatalogo
from catalogo.serializers import ProductoCatalogoSerializer
from .models import SolicitudPedido
from .serializers import SolicitudPedidoSerializer


class CatalogoPublicoView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = ProductoCatalogo.objects.filter(activo=True)
        categoria = request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria=categoria)
        serializer = ProductoCatalogoSerializer(qs, many=True)
        return Response(serializer.data)


class SolicitudPedidoCreateView(generics.CreateAPIView):
    queryset = SolicitudPedido.objects.all()
    serializer_class = SolicitudPedidoSerializer
    permission_classes = [permissions.AllowAny]
