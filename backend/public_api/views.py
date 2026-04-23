import datetime
from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from catalogo.models import ProductoCatalogo
from catalogo.serializers import ProductoCatalogoSerializer
from eventos.models import Evento
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


class MediaAssetViewSet(viewsets.ModelViewSet):

    queryset = MediaAsset.objects.all()
    serializer_class = MediaAssetSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Determine type based on file extension
        archivo = self.request.FILES.get('archivo')
        tipo = 'imagen'
        if archivo:
            ext = archivo.name.split('.')[-1].lower()
            if ext in ['mp4', 'mov', 'avi', 'webm', 'm4v']:
                tipo = 'video'
        serializer.save(tipo=tipo)


class BotContextView(APIView):
    """Returns business context for the AI bot: products, config, availability."""
    permission_classes = [permissions.AllowAny]

    def get(self, _request):
        config = ConfiguracionSitio.get_config()
        productos = ProductoCatalogo.objects.filter(activo=True).values(
            'nombre', 'descripcion', 'categoria', 'precio_venta'
        )

        # Fechas ocupadas próximos 60 días
        hoy = datetime.date.today()
        limite = hoy + datetime.timedelta(days=60)
        fechas_ocupadas = list(
            Evento.objects.filter(
                fecha__range=(hoy, limite),
                estado__in=['confirmado', 'en_proceso']
            ).values_list('fecha', flat=True)
        )

        return Response({
            'negocio': {
                'nombre': config.nombre_marca or 'RyF Banquetería',
                'eslogan': config.eslogan or '',
                'descripcion': config.nosotros_texto1 or '',
            },
            'productos': list(productos),
            'fechas_ocupadas': [str(f) for f in fechas_ocupadas],
            'hoy': str(hoy),
        })

