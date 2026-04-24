"""
Django settings for GESTION INTEGRAL project.
"""
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-gestion-integral-dev-key-change-in-production'

DEBUG = True

ALLOWED_HOSTS = ['*']  # Permitir todos en producción (seguro detrás de Caddy/Nginx)

CSRF_TRUSTED_ORIGINS = [
    'https://kruxel.cl',
    'https://www.kruxel.cl',
    'https://ryfbanqueteria.kruxel.cl',
]

# Agregar dinámicamente desde variable de entorno si existe
if os.environ.get("ALLOWED_HOSTS"):
    extra_hosts = [f'https://{host.strip()}' for host in os.environ.get("ALLOWED_HOSTS").split(",")]
    CSRF_TRUSTED_ORIGINS.extend(extra_hosts)

SHARED_APPS = [
    'django_tenants',
    'tenants',
    # Django core (shared)
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.admin',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party (shared)
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Users shared across tenants
    'usuarios',
]

TENANT_APPS = [
    'django.contrib.contenttypes',
    # Business apps — isolated per tenant
    'eventos',
    'cobros',
    'inventario',
    'dashboard',
    'exportaciones',
    'gastos',
    'catalogo',
    'public_api',
]

INSTALLED_APPS = list(SHARED_APPS) + [a for a in TENANT_APPS if a not in SHARED_APPS]

TENANT_MODEL = 'tenants.Client'
TENANT_DOMAIN_MODEL = 'tenants.Domain'

# Public schema serves tenant management admin only
PUBLIC_SCHEMA_URLCONF = 'config.urls_public'

MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',  # must be first
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

import urllib.parse
from decouple import config

# Selección dinámica de base de datos usando .env
DB_ENGINE = config('DB_ENGINE', default='django.db.backends.sqlite3')
DATABASE_URL = config('DATABASE_URL', default=None)

if DATABASE_URL:
    urllib.parse.uses_netloc.append('postgres')
    url = urllib.parse.urlparse(DATABASE_URL)
    DATABASES = {
        'default': {
            'ENGINE': 'django_tenants.postgresql_backend',
            'NAME': url.path[1:],
            'USER': url.username,
            'PASSWORD': url.password,
            'HOST': url.hostname,
            'PORT': url.port or '5432',
        }
    }
elif DB_ENGINE in ('django.db.backends.postgresql', 'django_tenants.postgresql_backend'):
    DATABASES = {
        'default': {
            'ENGINE': 'django_tenants.postgresql_backend',
            'NAME': config('DB_NAME', default='gestion_integral_db'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }
else:
    # SQLite for local dev without tenants (limited — no schema isolation)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

DATABASE_ROUTERS = ['django_tenants.routers.TenantSyncRouter']

AUTH_USER_MODEL = 'usuarios.Usuario'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 4}},
]

LANGUAGE_CODE = 'es-cl'
TIME_ZONE = 'America/Santiago'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CORS
CORS_ALLOW_ALL_ORIGINS = True

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DATETIME_FORMAT': '%d/%m/%Y %H:%M',
    'DATE_FORMAT': '%d/%m/%Y',
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
