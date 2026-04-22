from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from catalogo.models import ProductoCatalogo
from catalogo.serializers import ProductoCatalogoSerializer
from .models import SolicitudPedido, MediaAsset, ConfiguracionSitio
from .serializers import SolicitudPedidoSerializer, MediaAssetSerializer, ConfiguracionSitioSerializer


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


class SolicitudPedidoListView(generics.ListAPIView):
    queryset = SolicitudPedido.objects.all().order_by('-created_at')
    serializer_class = SolicitudPedidoSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]


class SolicitudPedidoDetailView(generics.UpdateAPIView):
    queryset = SolicitudPedido.objects.all()
    serializer_class = SolicitudPedidoSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]


class MediaAssetListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = MediaAsset.objects.filter(activo=True)
        serializer = MediaAssetSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class ConfiguracionSitioView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, _request):
        config = ConfiguracionSitio.get_config()
        return Response(ConfiguracionSitioSerializer(config).data)

    def patch(self, request):
        config = ConfiguracionSitio.get_config()
        serializer = ConfiguracionSitioSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
