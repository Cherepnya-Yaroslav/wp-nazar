# Восстановление WordPress сайта из бэкапа Updraft

Этот архив содержит бэкап WordPress сайта, созданный с помощью плагина UpdraftPlus.

## Быстрый старт

### Вариант 1: Использование Docker (Рекомендуется)

1. **Убедитесь, что у вас установлен Docker Desktop**
   - Скачайте с https://www.docker.com/products/docker-desktop
   - Запустите Docker Desktop

2. **Запустите сайт одной командой:**
   ```bash
   ./start.sh
   ```
   
   Или вручную:
   ```bash
   docker-compose up -d
   ./restore-database.sh
   ```

3. **Откройте сайт в браузере:**
   ```
   http://localhost:8080
   ```
   
   **Важно:** При первом запуске WordPress может показать страницу установки. Это нормально - просто обновите страницу через несколько секунд, база данных уже восстановлена.

### Вариант 2: Локальный сервер (MAMP, XAMPP, Local by Flywheel)

1. **Распакуйте архивы** (уже распакованы в папку `wordpress_site`)

2. **Скопируйте содержимое `wordpress_site` в папку вашего локального сервера:**
   - Для MAMP: `/Applications/MAMP/htdocs/your-site`
   - Для XAMPP: `/Applications/XAMPP/htdocs/your-site`
   - Для Local: создайте новый сайт и замените содержимое

3. **Создайте базу данных MySQL:**
   - Имя БД: `wordpress`
   - Пользователь: `wordpress`
   - Пароль: `wordpress`

4. **Восстановите базу данных:**
   ```bash
   gunzip -c backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-db.gz | mysql -u wordpress -p wordpress
   ```

5. **Обновите URL в базе данных:**
   ```sql
   UPDATE wp_options SET option_value = 'http://localhost:8080' WHERE option_name = 'siteurl';
   UPDATE wp_options SET option_value = 'http://localhost:8080' WHERE option_name = 'home';
   ```

6. **Создайте файл `wp-config.php`** в корне сайта с настройками подключения к БД

## Структура архива

- `backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-db.gz` - база данных MySQL
- `backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-plugins.zip` - плагины
- `backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-themes.zip` - темы
- `backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-uploads.zip` - загруженные файлы
- `backup_2023-09-13-0708_seventyseven_bd7bd6b5347d-others.zip` - другие файлы

## Важные замечания

1. **Ядро WordPress не включено в бэкап** - нужно установить WordPress отдельно или использовать Docker образ
2. **URL сайта** был `http://s.we-digital.ru` - его нужно изменить на локальный адрес
3. **Плагины и темы** уже распакованы в соответствующие папки

## Остановка Docker контейнеров

```bash
docker-compose down
```

Для полной очистки (включая базу данных):
```bash
docker-compose down -v
```

