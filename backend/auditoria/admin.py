from django.contrib import admin
from django.utils.html import format_html
from auditlog.models import LogEntry
from .models import LoginLog


@admin.register(LoginLog)
class LoginLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'usuario', 'accion_badge', 'ip', 'user_agent_short')
    list_filter = ('accion',)
    search_fields = ('usuario', 'ip')
    readonly_fields = ('usuario', 'accion', 'ip', 'user_agent', 'timestamp')
    ordering = ('-timestamp',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def accion_badge(self, obj):
        colors = {
            'login': '#22c55e',
            'logout': '#94a3b8',
            'login_fallido': '#ef4444',
        }
        color = colors.get(obj.accion, '#94a3b8')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px">{}</span>',
            color, obj.get_accion_display()
        )
    accion_badge.short_description = 'Acción'

    def user_agent_short(self, obj):
        return obj.user_agent[:60] + '...' if len(obj.user_agent) > 60 else obj.user_agent
    user_agent_short.short_description = 'User Agent'


class LogEntryAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'actor', 'action_badge', 'content_type', 'object_repr', 'changes_short')
    list_filter = ('action', 'content_type')
    search_fields = ('actor__username', 'object_repr')
    readonly_fields = ('timestamp', 'actor', 'action', 'content_type', 'object_id',
                       'object_repr', 'changes', 'remote_addr', 'additional_data')
    ordering = ('-timestamp',)
    date_hierarchy = 'timestamp'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def action_badge(self, obj):
        colors = {0: '#22c55e', 1: '#3b82f6', 2: '#ef4444'}
        labels = {0: 'Creado', 1: 'Modificado', 2: 'Eliminado'}
        color = colors.get(obj.action, '#94a3b8')
        label = labels.get(obj.action, str(obj.action))
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px">{}</span>',
            color, label
        )
    action_badge.short_description = 'Acción'

    def changes_short(self, obj):
        if not obj.changes:
            return '—'
        text = str(obj.changes)
        return text[:80] + '...' if len(text) > 80 else text
    changes_short.short_description = 'Cambios'


admin.site.register(LogEntry, LogEntryAdmin)
