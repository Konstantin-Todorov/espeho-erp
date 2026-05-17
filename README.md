# ЕСПЕХО ERP — Производствена система

Пълна ERP система за **ЕСПЕХО ООД** — производство на стъклопакети и стъкло.

## Модули

| Модул | Описание |
|-------|----------|
| 🔐 Auth | JWT вход, роли: admin / office / production / warehouse |
| 📋 Поръчки | Създаване, статусен поток, детайли с артикули |
| 🏭 Производство | Канбан борд, поетапно следене, запис на труд |
| ⚠ Брак | Регистрация, разходи, репорти по причина/работник |
| 📦 Склад | Наличности, получаване, изписване към поръчки |
| 💰 Себестойност | Материали + труд + машини + режийни = марж |
| 👥 Клиенти | База с история на поръчките |
| ⚙ Машини | Списък + журнал за поддръжка |
| 📊 Репорти | Финанси, производство, материали, брак |

---

## Бърз старт (разработка)

### Изисквания
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Настрой базата данни

```bash
createdb espeho_erp
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Редактирай .env с твоите DB credentials
npm run migrate    # Създава всички таблици
npm run seed       # Зарежда тестови данни
npm run dev        # Стартира на порт 5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev        # Стартира на порт 5173
```

Отвори http://localhost:5173

---

## Акаунти за влизане (след seed)

| Email | Парола | Роля |
|-------|--------|------|
| admin@espeho.com | espeho2024 | Администратор |
| office1@espeho.com | espeho2024 | Офис |
| prod1@espeho.com | espeho2024 | Производство |
| warehouse1@espeho.com | espeho2024 | Склад |

---

## Деплой на VPS (Superhosting)

### Изисквания на сървъра
- Ubuntu 22.04 VPS
- Node.js 18 (чрез nvm)
- PostgreSQL 14
- Nginx + PM2

### Стъпки

```bash
# 1. Клонирай проекта
git clone <repo> /var/www/espeho-erp
cd /var/www/espeho-erp

# 2. База данни
sudo -u postgres createdb espeho_erp
sudo -u postgres createuser espeho_user
sudo -u postgres psql -c "ALTER USER espeho_user WITH PASSWORD 'strong_password';"
sudo -u postgres psql -c "GRANT ALL ON DATABASE espeho_erp TO espeho_user;"

# 3. Backend
cd backend
npm install --production
cp .env.example .env
# Настрой .env за production
npm run migrate
npm run seed  # само за първоначална настройка

# 4. Frontend build
cd ../frontend
npm install
npm run build
# Резултатът е в frontend/dist/

# 5. PM2 за backend
npm install -g pm2
pm2 start backend/src/index.js --name espeho-backend
pm2 save
pm2 startup

# 6. Nginx конфигурация
```

**Nginx config** (`/etc/nginx/sites-available/espeho`):

```nginx
server {
    listen 80;
    server_name soft.espeho.com;

    # Frontend (статични файлове)
    root /var/www/espeho-erp/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy към backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Файлове/uploads
    location /uploads {
        alias /var/www/espeho-erp/backend/uploads;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/espeho /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL с Let's Encrypt
sudo certbot --nginx -d soft.espeho.com
```

---

## Структура

```
espeho-erp/
├── backend/
│   ├── src/
│   │   ├── routes/      # auth, orders, production, defects, warehouse, machines, reports, files
│   │   ├── middleware/  # auth.js, roleCheck.js
│   │   ├── db/          # pool.js, migrate.js, seed.js, migrations/
│   │   └── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/       # Login, Dashboard, Orders, OrderDetail, Production, Defects, Warehouse, Clients, Machines, Reports, Users
│   │   ├── components/  # Layout, Sidebar, LowStockAlert, ui/
│   │   ├── context/     # AuthContext.jsx
│   │   ├── api/         # axios.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

---

## Бизнес правила

- Поръчките се движат само напред: НОВА → МАТЕРИАЛИ → ПРОИЗВОДСТВО → ГОТОВА → ДОСТАВЕНА
- Администраторът може да прескача стъпки
- Производствени работници не виждат цени и финансови данни
- Ниска наличност на материали = постоянен alert за склад + admin
- Просрочените поръчки се показват в ЧЕРВЕНО навсякъде

## Технологии

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, PostgreSQL (pg)
- **Auth**: JWT + bcrypt
- **Шрифт**: IBM Plex Sans
- **Тема**: Тъмна (#0f1117 bg, #3b82f6 accent)
