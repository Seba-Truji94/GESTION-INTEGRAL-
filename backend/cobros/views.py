from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import viewsets, permissions
from .models import Cobro, Pago, SeguimientoEvento, DatosTransferencia
from .serializers import (
    CobroSerializer, CobroCreateSerializer, PagoSerializer, 
    SeguimientoSerializer, DatosTransferenciaSerializer
)

# ... existing views ...

class DatosTransferenciaViewSet(viewsets.ModelViewSet):
    queryset = DatosTransferencia.objects.all()
    serializer_class = DatosTransferenciaSerializer
    permission_classes = []  # Public
    pagination_class = None
from eventos.models import Evento


class CobroListCreateView(generics.ListCreateAPIView):
    queryset = Cobro.objects.select_related('presupuesto__evento').prefetch_related('pagos').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['presupuesto__numero', 'presupuesto__evento__nombre', 'presupuesto__evento__cliente']
    ordering_fields = ['created_at', 'monto_total', 'estado']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CobroCreateSerializer
        return CobroSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        estado = self.request.query_params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CobroDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cobro.objects.select_related('presupuesto__evento').prefetch_related('pagos').all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CobroCreateSerializer
        return CobroSerializer


class PagoCreateView(generics.CreateAPIView):
    """Register a payment against a cobro."""
    serializer_class = PagoSerializer

    def perform_create(self, serializer):
        cobro = Cobro.objects.get(pk=self.kwargs['cobro_pk'])
        serializer.save(cobro=cobro, created_by=self.request.user)
        cobro.actualizar_estado()


class PagoListView(generics.ListAPIView):
    serializer_class = PagoSerializer

    def get_queryset(self):
        return Pago.objects.filter(cobro_id=self.kwargs['cobro_pk'])


class PagoDetailView(generics.RetrieveAPIView):
    queryset = Pago.objects.all()
    serializer_class = PagoSerializer
    permission_classes = [permissions.IsAuthenticated]


class SeguimientoListView(generics.ListAPIView):
    """Timeline of an event."""
    serializer_class = SeguimientoSerializer

    def get_queryset(self):
        return SeguimientoEvento.objects.filter(evento_id=self.kwargs['evento_pk'])


class SeguimientoCreateView(generics.CreateAPIView):
    serializer_class = SeguimientoSerializer

    def perform_create(self, serializer):
        evento = Evento.objects.get(pk=self.kwargs['evento_pk'])
        estado_anterior = evento.estado
        estado_nuevo = self.request.data.get('estado_nuevo', evento.estado)
        # Update the event state
        if estado_nuevo != estado_anterior:
            evento.estado = estado_nuevo
            evento.save(update_fields=['estado'])
        serializer.save(
            evento=evento,
            estado_anterior=estado_anterior,
            estado_nuevo=estado_nuevo,
            usuario=self.request.user
        )
