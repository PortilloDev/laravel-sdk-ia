-- Activar la extensión pgvector al inicializar la base de datos.
-- Solo se ejecuta la primera vez que se crea el volumen de datos.
CREATE EXTENSION IF NOT EXISTS vector;
