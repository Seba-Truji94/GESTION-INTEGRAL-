#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Poblar base de datos con datos iniciales (solo si está vacía)
python seed_v2.py
