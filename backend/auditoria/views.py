from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from auditlog.models import LogEntry
from .models import LoginLog


class AuditLogListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 50)), 200)
        accion = request.query_params.get('accion')  # created/updated/deleted

        qs = LogEntry.objects.select_related('actor', 'content_type').order_by('-timestamp')
        if accion:
            action_map = {'created': 0, 'updated': 1, 'deleted': 2}
            if accion in action_map:
                qs = qs.filter(action=action_map[accion])

        action_labels = {0: 'Creado', 1: 'Modificado', 2: 'Eliminado'}
        data = []
        for entry in qs[:limit]:
            data.append({
                'id': entry.id,
                'timestamp': entry.timestamp.strftime('%d/%m/%Y %H:%M:%S'),
                'usuario': entry.actor.username if entry.actor else 'Sistema',
                'accion': action_labels.get(entry.action, str(entry.action)),
                'modelo': entry.content_type.model if entry.content_type else '',
                'objeto': entry.object_repr,
                'cambios': entry.changes,
                'ip': entry.remote_addr,
            })
        return Response(data)


class LoginLogListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 50)), 200)
        qs = LoginLog.objects.order_by('-timestamp')[:limit]
        data = [{
            'id': l.id,
            'timestamp': l.timestamp.strftime('%d/%m/%Y %H:%M:%S'),
            'usuario': l.usuario,
            'accion': l.get_accion_display(),
            'ip': l.ip,
        } for l in qs]
        return Response(data)
