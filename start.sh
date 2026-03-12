#!/bin/bash

# Скрипт для запуска WordPress сайта из бэкапа

echo "🚀 Запуск WordPress сайта из бэкапа Updraft..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен."
    exit 1
fi

# Запускаем контейнеры
echo "📦 Запуск Docker контейнеров..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

# Ждем пока MySQL запустится
echo "⏳ Ожидание запуска MySQL (30 секунд)..."
sleep 30

# Распаковываем базу данных если нужно
if [ ! -f "backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-db.sql" ]; then
    echo "📂 Распаковка базы данных..."
    gunzip -c backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-db.gz > backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-db.sql
fi

# Импортируем базу данных
echo "💾 Импорт базы данных..."
docker exec -i wp_mysql mysql -uroot -prootpassword wordpress < backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-db.sql 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ База данных импортирована"
else
    echo "⚠️  Попытка импорта базы данных (может потребоваться повторный запуск скрипта)"
fi

# Обновляем URL сайта для локальной работы
echo "🔧 Обновление URL сайта на локальный..."
docker exec -i wp_mysql mysql -uroot -prootpassword wordpress <<EOF 2>/dev/null
UPDATE wp_options SET option_value = 'http://localhost:8080' WHERE option_name = 'siteurl';
UPDATE wp_options SET option_value = 'http://localhost:8080' WHERE option_name = 'home';
EOF

echo ""
echo "✅ Готово! Сайт запущен."
echo ""
echo "🌐 Откройте в браузере: http://localhost:8080"
echo ""
echo "📝 Для остановки используйте: docker-compose down (или docker compose down)"
echo ""

