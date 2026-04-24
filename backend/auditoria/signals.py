from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver
from auditlog.registry import auditlog

from eventos.models import Evento, Presupuesto, ItemPresupuesto
from cobros.models import Cobro, Pago, DatosTransferencia
from catalogo.models import ProductoCatalogo
from inventario.models import Producto, MovimientoStock
from gastos.models import GastoFijo
from public_api.models import SolicitudPedido, MediaAsset, ConfiguracionSitio


# Registrar todos los modelos de negocio
auditlog.register(Evento)
auditlog.register(Presupuesto)
auditlog.register(ItemPresupuesto)
auditlog.register(Cobro)
auditlog.register(Pago)
auditlog.register(DatosTransferencia)
auditlog.register(ProductoCatalogo)
auditlog.register(Producto)
auditlog.register(MovimientoStock)
auditlog.register(GastoFijo)
auditlog.register(SolicitudPedido)
auditlog.register(MediaAsset)
auditlog.register(ConfiguracionSitio)


def _get_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


@receiver(user_logged_in)
def log_login(sender, request, user, **kwargs):
    from auditoria.models import LoginLog
    LoginLog.objects.create(
        usuario=user.username,
        accion='login',
        ip=_get_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )


@receiver(user_logged_out)
def log_logout(sender, request, user, **kwargs):
    from auditoria.models import LoginLog
    if user:
        LoginLog.objects.create(
            usuario=user.username,
            accion='logout',
            ip=_get_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )


@receiver(user_login_failed)
def log_login_failed(sender, credentials, request, **kwargs):
    from auditoria.models import LoginLog
    LoginLog.objects.create(
        usuario=credentials.get('username', '?'),
        accion='login_fallido',
        ip=_get_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )
