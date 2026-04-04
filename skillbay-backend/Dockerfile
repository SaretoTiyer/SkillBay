# syntax=docker/dockerfile:1

# ============================================================
# Stage 1: Install PHP dependencies (Composer)
# ============================================================
FROM composer:2 AS composer-install

WORKDIR /app

# Copy composer files first for layer caching
COPY composer.json composer.lock ./

# Install production dependencies only
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

# ============================================================
# Stage 2: Install Node dependencies & build frontend assets
# ============================================================
FROM node:20-alpine AS npm-build

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

RUN npm ci

# Copy all source files
COPY . .

# Build Vite assets (outputs to public/build/)
RUN npm run build

# ============================================================
# Stage 3: Final PHP-FPM image
# ============================================================
FROM php:8.2-fpm AS production

# Prevent PHP from buffering stdout/stderr
ENV PHP_FPM_DOCKERIZE_DAEMONIZE=no

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # PHP extensions
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    libpq-dev \
    default-mysql-client \
    unzip \
    git \
    curl \
    # Nginx
    nginx \
    # Queue worker supervision
    supervisor \
    # Health check
    wait-for-it \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    pdo_pgsql \
    mysqli \
    gd \
    zip \
    xml \
    mbstring \
    curl \
    tokenizer \
    ctype \
    bcmath \
    exif \
    fileinfo

# Install Redis extension
RUN pecl install redis \
    && docker-php-ext-enable redis

# Install OPcache
RUN docker-php-ext-install opcache \
    && docker-php-ext-enable opcache

# Set working directory
WORKDIR /var/www/html

# Copy Composer dependencies from stage 1
COPY --from=composer-install /app/vendor/ ./vendor/

# Copy built assets from stage 2
COPY --from=npm-build /app/public/build/ ./public/build/

# Copy application source
COPY . .

# Create required directories and set permissions
RUN mkdir -p \
    storage/framework/{sessions,views,cache} \
    storage/logs \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy Nginx configuration
COPY docker/nginx/default.conf /etc/nginx/sites-available/default

# Copy Supervisor configuration (manages PHP-FPM + queue worker)
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose ports
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:80/up || exit 1

# Use entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Default command: start supervisord (PHP-FPM + Nginx + queue worker)
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
