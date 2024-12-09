#!/bin/bash

# Obtener variables de entorno de Prisma
if [ -f .env ]; then
  export $(cat .env | grep POSTGRES_PRISMA_URL)
fi

# Verificar que tenemos la URL de conexión
if [ -z "$POSTGRES_PRISMA_URL" ]; then
  echo "Error: POSTGRES_PRISMA_URL no encontrada en el archivo .env"
  echo "Asegúrate de tener las credenciales de Vercel Postgres en tu archivo .env"
  exit 1
fi

# Extraer componentes de la URL de Vercel Postgres
# Ejemplo: postgres://user:password@host:port/verceldb
DB_USER=$(echo $POSTGRES_PRISMA_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $POSTGRES_PRISMA_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $POSTGRES_PRISMA_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $POSTGRES_PRISMA_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $POSTGRES_PRISMA_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Crear directorio de backups si no existe
BACKUP_DIR="./vercel_backups"
mkdir -p $BACKUP_DIR

# Generar nombre de archivo con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/vercel_${DB_NAME}_${TIMESTAMP}.sql"

# Configurar variables de entorno para SSL (requerido por Vercel)
export PGSSLMODE="require"

# Realizar el backup
PGPASSWORD=$DB_PASS pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  -F p \
  --no-owner \
  --no-acl \
  -f $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "Backup creado exitosamente en: $BACKUP_FILE"
  
  # Comprimir el archivo
  gzip $BACKUP_FILE
  echo "Archivo comprimido: ${BACKUP_FILE}.gz"
  
  # Mostrar tamaño del archivo
  du -h "${BACKUP_FILE}.gz"
else
  echo "Error al crear el backup"
  echo "Verifica que tienes acceso a la base de datos de Vercel"
  exit 1
fi