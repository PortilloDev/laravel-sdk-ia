#!/bin/bash

# Esperar a que PostgreSQL esté listo
while ! nc -z postgres 5432; do
  sleep 0.1
done

echo "PostgreSQL está listo, iniciando Laravel..."

# Ejecutar migraciones
php artisan migrate --force

# Iniciar PHP-FPM
php-fpm
