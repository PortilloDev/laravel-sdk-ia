# Docker Setup para Laravel Agent

This project uses Docker with PHP 8.4, PostgreSQL, and Nginx.

## Requisitos

- Docker
- Docker Compose

## Estructura Docker

```
docker/
├── nginx/
│   ├── conf.d/
│   │   └── app.conf
│   └── ssl/
└── entrypoint.sh
```

## Comandos Principales

### Iniciar el proyecto

```bash
docker-compose up -d
```

### Detener el proyecto

```bash
docker-compose down
```

### Ejecutar migraciones

```bash
docker-compose exec app php artisan migrate
```

### Ver logs

```bash
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f postgres
```

### Acceder a la shell de la app

```bash
docker-compose exec app bash
```

### Acceder a PostgreSQL

```bash
docker-compose exec postgres psql -U symfony -d laravel-agent-dev
```

### Ejecutar Artisan commands

```bash
docker-compose exec app php artisan [comando]
```

### Ejecutar tests

```bash
docker-compose exec app php artisan test
```

### Rebuildar la imagen

```bash
docker-compose build --no-cache
```

## Puertos

- **Aplicación (Nginx)**: http://localhost:80
- **PostgreSQL**: localhost:5432
- **PHP-FPM**: localhost:9000

## Variables de entorno

Las variables están en `.env` - configuradas para funcionar con Docker:

```
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=laravel-agent-dev
DB_USERNAME=symfony
DB_PASSWORD=ChangeMe
```

## Servicios

### Laravel (PHP 8.4 + FPM)

- Imagen personalizada basada en `php:8.4-fpm`
- Incluye extensiones necesarias: PDO, PostgreSQL, Composer
- Puerto: 9000

### PostgreSQL 16

- Imagen: `postgres:16-alpine`
- Usuario: `symfony`
- Contraseña: `ChangeMe`
- Database: `laravel-agent-dev`
- Volumen persistente: `postgres_data`

### Nginx

- Imagen: `nginx:alpine`
- Configuración: `docker/nginx/conf.d/app.conf`
- Puertos: 80 (HTTP), 443 (HTTPS)

## Volúmenes

- `/var/www` - Código de la aplicación (bind mount)
- `postgres_data` - Datos de PostgreSQL (volumen persistente)

## Red

Red bridge llamada `laravel` para comunicación entre servicios.

## Notas de Desarrollo

- Los cambios en el código se reflejan inmediatamente en la app
- Las migraciones se ejecutan automáticamente al iniciar
- Para desarrollo con Vite, ejecuta:
  ```bash
  docker-compose exec app npm run dev
  ```

## Troubleshooting

**Puerto ya en uso:**
```bash
docker-compose down
lsof -i :80  # Encontrar qué usa el puerto
```

**Limpiar datos de PostgreSQL:**
```bash
docker-compose down -v
```

**Reconstruir todo:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```
