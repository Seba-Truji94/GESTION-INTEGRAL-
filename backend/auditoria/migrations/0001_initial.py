from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LoginLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('usuario', models.CharField(max_length=150)),
                ('accion', models.CharField(choices=[('login', 'Inicio de sesión'), ('logout', 'Cierre de sesión'), ('login_fallido', 'Intento fallido')], max_length=20)),
                ('ip', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Log de acceso',
                'verbose_name_plural': 'Logs de acceso',
                'ordering': ['-timestamp'],
            },
        ),
    ]
