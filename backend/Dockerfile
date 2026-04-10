# Usar imagen oficial de Python ligera
FROM python:3.11-slim

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2 o utilidades
RUN apt-get update \
    && apt-get install -y gcc libpq-dev netcat-openbsd \
    && apt-get clean

# Copiar requerimientos e instalarlos
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copiar el código del proyecto
COPY . /app/

# Exponer el puerto
EXPOSE 8000

# Comando para correr migraciones y levantar el servidor
CMD ["bash", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
