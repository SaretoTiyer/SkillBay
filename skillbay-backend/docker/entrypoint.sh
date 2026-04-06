#!/bin/bash
set -e

echo "🚀 Starting SkillBay Backend..."

# Wait for database to be ready using PHP PDO
if [ -n "$DB_HOST" ]; then
    echo "⏳ Waiting for database at $DB_HOST:$DB_PORT..."
    RETRIES=30
    until php -r "try { new PDO('mysql:host=$DB_HOST;port=$DB_PORT', '$DB_USERNAME', '$DB_PASSWORD'); exit(0); } catch(Exception \$e) { exit(1); }" 2>/dev/null || [ $RETRIES -eq 0 ]; do
        echo "   Database not ready yet, retrying in 2s... ($RETRIES retries left)"
        RETRIES=$((RETRIES - 1))
        sleep 2
    done
    if [ $RETRIES -eq 0 ]; then
        echo "❌ Database connection failed after 60s. Continuing anyway..."
    else
        echo "✅ Database is ready!"
    fi
fi

# Run migrations (safe to run multiple times)
echo "📦 Running migrations..."
php artisan migrate --force --no-interaction

# Run seeders in development mode only
if [ "$APP_ENV" != "production" ]; then
    echo "🌱 Running seeders (development mode)..."
    php artisan db:seed --force --no-interaction 2>&1 || echo "   Seeders already ran or skipped"
fi

# Create storage symlink
echo "🔗 Creating storage symlink..."
php artisan storage:link 2>/dev/null || echo "   Storage link already exists"

# Only cache in production
if [ "$APP_ENV" = "production" ]; then
    echo "⚡ Optimizing for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
else
    echo "🔧 Development mode - skipping cache"
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
fi

echo "✅ Backend ready!"

# Execute the CMD (supervisord)
exec "$@"
