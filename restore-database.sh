#!/bin/bash

# Скрипт для восстановления базы данных WordPress из бэкапа Updraft

echo "Восстановление базы данных WordPress..."

# Распаковываем базу данных
if [ ! -f "backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-db.sql" ]; then
    echo "Распаковка базы данных..."
    gunzip -c backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-db.gz > backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-db.sql
fi

# Ждем пока MySQL запустится
echo "Ожидание запуска MySQL..."
sleep 10

# Импортируем базу данных
echo "Импорт базы данных..."
docker exec -i wp_mysql mysql -uroot -prootpassword wordpress < backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-db.sql

# Обновляем URL сайта для локальной работы
echo "Обновление URL сайта на локальный..."
docker exec -i wp_mysql mysql -uroot -prootpassword wordpress <<EOF
UPDATE wp_options SET option_value = 'http://localhost:8080' WHERE option_name = 'siteurl';
UPDATE wp_options SET option_value = 'http://localhost:8080' WHERE option_name = 'home';
EOF

echo "База данных восстановлена!"
echo "Сайт будет доступен по адресу: http://localhost:8080"


