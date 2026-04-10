from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import GastoFijo
from .serializers import GastoFijoSerializer


class GastoFijoViewSet(viewsets.ModelViewSet):
    queryset = GastoFijo.objects.all()
    serializer_class = GastoFijoSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        mes = self.request.query_params.get('mes')
        anio = self.request.query_params.get('anio')
        
        if mes:
            qs = qs.filter(mes=mes)
        if anio:
            qs = qs.filter(anio=anio)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='clonar-mes-anterior')
    def clonar_mes_anterior(self, request):
        """Copies all fixed costs from the previous month to the current one."""
        ahora = timezone.now()
        # Current month/year
        mes_actual = ahora.month
        anio_actual = ahora.year
        
        # Previous month
        if mes_actual == 1:
            mes_prev = 12
            anio_prev = anio_actual - 1
        else:
            mes_prev = mes_actual - 1
            anio_prev = anio_actual

        gastos_anteriores = GastoFijo.objects.filter(mes=mes_prev, anio=anio_prev)
        
        clonados = 0
        for g in gastos_anteriores:
            # Check if already exists for this month (by name and category) to avoid duplicates
            if not GastoFijo.objects.filter(
                nombre=g.nombre, 
                categoria=g.categoria, 
                mes=mes_actual, 
                anio=anio_actual
            ).exists():
                GastoFijo.objects.create(
                    nombre=g.nombre,
                    categoria=g.categoria,
                    monto=g.monto,
                    fecha_vencimiento=ahora.date(), # Set to today for user to adjust
                    estado='pendiente',
                    observaciones=f"Clonado de {mes_prev}/{anio_prev}. {g.observaciones}",
                    mes=mes_actual,
                    anio=anio_actual,
                    created_by=request.user
                )
                clonados += 1
        
        return Response({'clonados': clonados}, status=status.HTTP_201_CREATED)
