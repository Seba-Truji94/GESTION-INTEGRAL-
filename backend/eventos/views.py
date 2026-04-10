from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Evento, Presupuesto, ItemPresupuesto
from .serializers import (
    EventoListSerializer, EventoDetailSerializer, EventoCreateSerializer,
    PresupuestoSerializer, PresupuestoCreateSerializer, ItemPresupuestoSerializer
)


class EventoListCreateView(generics.ListCreateAPIView):
    queryset = Evento.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'cliente', 'lugar']
    ordering_fields = ['fecha', 'created_at', 'estado']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventoCreateSerializer
        return EventoListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        estado = self.request.query_params.get('estado')
        mes = self.request.query_params.get('mes')
        anio = self.request.query_params.get('anio')
        tipo = self.request.query_params.get('tipo')
        if estado:
            qs = qs.filter(estado=estado)
        if mes:
            qs = qs.filter(fecha__month=int(mes))
        if anio:
            qs = qs.filter(fecha__year=int(anio))
        if tipo:
            qs = qs.filter(tipo_evento=tipo)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class EventoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Evento.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventoCreateSerializer
        return EventoDetailSerializer


class PresupuestoListCreateView(generics.ListCreateAPIView):
    queryset = Presupuesto.objects.select_related('evento').prefetch_related('items').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['numero', 'evento__nombre', 'evento__cliente', 'cliente_nombre']
    ordering_fields = ['created_at', 'total']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PresupuestoCreateSerializer
        return PresupuestoSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        estado = self.request.query_params.get('estado')
        evento_id = self.request.query_params.get('evento')
        if estado:
            qs = qs.filter(estado=estado)
        if evento_id:
            qs = qs.filter(evento_id=evento_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PresupuestoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Presupuesto.objects.select_related('evento').prefetch_related('items').all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PresupuestoCreateSerializer
        return PresupuestoSerializer


class PresupuestoPublicoView(generics.RetrieveAPIView):
    queryset = Presupuesto.objects.select_related('evento').prefetch_related('items').all()
    serializer_class = PresupuestoSerializer
    permission_classes = []  # Public


class ItemPresupuestoListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemPresupuestoSerializer

    def get_queryset(self):
        return ItemPresupuesto.objects.filter(presupuesto_id=self.kwargs['presupuesto_pk'])

    def perform_create(self, serializer):
        pres = Presupuesto.objects.get(pk=self.kwargs['presupuesto_pk'])
        serializer.save(presupuesto=pres)
        pres.recalcular()


class ItemPresupuestoDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemPresupuestoSerializer

    def get_queryset(self):
        return ItemPresupuesto.objects.filter(presupuesto_id=self.kwargs['presupuesto_pk'])

    def perform_update(self, serializer):
        serializer.save()
        pres = Presupuesto.objects.get(pk=self.kwargs['presupuesto_pk'])
        pres.recalcular()

    def perform_destroy(self, instance):
        pres_id = instance.presupuesto_id
        instance.delete()
        pres = Presupuesto.objects.get(pk=pres_id)
        pres.recalcular()
