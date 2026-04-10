from django.urls import path
from . import views

urlpatterns = [
    path('exportar/eventos/', views.ExportEventosView.as_view(), name='export-eventos'),
    path('exportar/presupuestos/', views.ExportPresupuestosView.as_view(), name='export-presupuestos'),
    path('exportar/cobros/', views.ExportCobrosView.as_view(), name='export-cobros'),
    path('exportar/stock/', views.ExportStockView.as_view(), name='export-stock'),
    path('exportar/gastos/', views.ExportGastosView.as_view(), name='export-gastos'),
    path('exportar/dashboard/', views.ExportDashboardView.as_view(), name='export-dashboard'),
]
