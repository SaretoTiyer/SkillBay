#!/bin/bash
set -e

echo "🚀 Starting SkillBay Backend..."

# Wait for database to be ready
if [ -n "$DB_HOST" ]; then
    echo "⏳ Waiting for database at $DB_HOST:$DB_PORT..."
    until php artisan db:show --database="${DB_CONNECTION:-mysql}" > /dev/null 2>&1; do
        echo "   Database not ready yet, retrying in 2s..."
        sleep 2
    done
    echo "✅ Database is ready!"
fi

# Run migrations (safe to run multiple times)
echo "📦 Running migrations..."
php artisan migrate --force --no-interaction

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
