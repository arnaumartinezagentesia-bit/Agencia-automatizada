# Guía de Despliegue, Testing y Operación 24/7

**Estado:** Documento Operativo Canónico  
**Audiencia:** Desarrollador, Claude Code, Sysadmin  
**Aplica a:** Entorno Local (Desarrollo/Testing) y VPS Linux (Producción 24/7)

---

## 1. Visión General de la Infraestructura

El sistema se compone de 5 servicios interconectados:
1. **Frontend:** Servidor web estático o SSR (Next.js/React + Phaser.js Canvas + Tailwind).
2. **Backend API:** FastAPI (endpoints HTTP, autenticación, WebSockets para eventos en tiempo real).
3. **Workers & Scheduler:** Celery / ARQ / Celery Beat (ejecución de backtests, LangGraph workflows pesados, cron job de Obsidian Librarian).
4. **Base de Datos:** PostgreSQL (fuente de verdad operacional y auditoría).
5. **Caché y Mensajería:** Redis (broker de tareas, pub/sub de WebSockets, caché efímera).
6. **Bóveda de Conocimiento:** Sistema de archivos montado (`./obsidian_vault`).

---

## FASE 1: Desarrollo, Testing y Observabilidad Local

Durante la construcción del proyecto, **no lo despliegas en un servidor remoto de inmediato**. Todo se ejecuta en tu máquina local mediante **Docker Compose** o entornos virtuales locales.

### 1.1 Estructura del Entorno Local (`docker-compose.dev.yml`)

Para levantar todo el stack con un único comando en tu ordenador:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: agencia_postgres_dev
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: agencia_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata_dev:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: agencia_redis_dev
    ports:
      - "6379:6379"

  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend.dev
    container_name: agencia_backend_dev
    command: uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./src:/app/src
      - ./obsidian_vault:/app/obsidian_vault
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:devpassword@postgres:5432/agencia_db
      - REDIS_URL=redis://redis:6379/0
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on:
      - postgres
      - redis

  worker:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend.dev
    container_name: agencia_worker_dev
    command: python -m src.workers.celery_app worker --loglevel=info
    volumes:
      - ./src:/app/src
      - ./obsidian_vault:/app/obsidian_vault
    environment:
      - DATABASE_URL=postgresql://postgres:devpassword@postgres:5432/agencia_db
      - REDIS_URL=redis://redis:6379/0
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on:
      - backend
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: agencia_frontend_dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

volumes:
  pgdata_dev:
```

### 1.2 Cómo ponerlo en marcha para pruebas (Paso a Paso)

1. **Crear archivo de variables locales (`.env.local`):**
   Configuras tus API keys de LLM (OpenRouter, Anthropic) y secretos locales.
2. **Levantar los contenedores:**
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
3. **Acceder y Probar:**
   - **Frontend:** Abre `http://localhost:3000` en tu navegador para ver la oficina Pixel Art y el panel de control.
   - **Backend API & Swagger Docs:** Abre `http://localhost:8000/docs` para ver y probar todos los endpoints HTTP.
   - **Consola de Logs:** Toda la salida de los agentes, queries a base de datos y eventos de WebSocket aparecerán en tiempo real en tu terminal.

### 1.3 Cómo Observar el Funcionamiento en Local

1. **Observabilidad del Frontend:**
   - La pantalla de Pixel Art mostrará a los avatares cambiando de animación según su estado (`IDLE` -> `THINKING` -> `WORKING` -> `SUCCESS` o `ALERT`).
   - Abres la consola del desarrollador en el navegador (`F12` -> pestaña *Console* y *Network -> WS*) para ver los paquetes JSON que llegan por WebSocket en milisegundos.
   - Panel lateral en Tailwind: muestra la traza de decisiones, el estado del Comité de Trading y los gráficos de backtest.
2. **Observabilidad del Backend y Agentes:**
   - Visualización de logs unificados con `docker compose logs -f backend worker`.
   - Si se usa LangSmith o OpenTelemetry, configuras la variable `LANGCHAIN_TRACING_V2=true` para ver el grafo visual exacto de LangGraph paso por paso en tu panel web.
   - **Explorador de Base de Datos:** Puedes conectar herramientas como DBeaver o pgAdmin a `localhost:5432` para verificar cómo se guardan las tablas operacionales (`strategies`, `backtests`, `decisions`).
   - **Obsidian:** Abres la carpeta `./obsidian_vault` con la aplicación de escritorio de Obsidian para ver cómo se generan los logs brutos en `99_raw_logs/` y cómo el Librarian crea las notas curadas.

---

## FASE 2: Despliegue en Producción (24/7 en un VPS Linux)

Una vez que todas las pruebas locales pasan y el sistema es robusto, se traslada a un servidor en la nube (VPS en Hetzner, DigitalOcean, AWS, OVH, etc., con Linux Ubuntu 22.04/24.04 LTS).

### 2.1 Requisitos del Servidor VPS
- **CPU:** Mínimo 4 Cores.
- **RAM:** Mínimo 8 GB (Recomendado 16 GB si se ejecutan simulaciones de backtesting pesadas).
- **Disco:** 50 GB+ SSD / NVMe.
- **Sistema Operativo:** Ubuntu 22.04 / 24.04 LTS.

### 2.2 Arquitectura de Producción 24/7

En el VPS no dejamos los procesos corriendo en una terminal abierta. Se utilizan herramientas de orquestación y tolerancia a fallos:

```
[ Internet / Navegador ]
         │
         ▼
[ Nginx Reverse Proxy (SSL / HTTPS / WSS vía Let's Encrypt) ]
         │
         ├───▶ /api/ & /ws/ ──▶ [ FastAPI Backend (Gunicorn + Uvicorn Workers) ]
         │                               │
         │                               ├──▶ [ PostgreSQL ] (Persistencia segura)
         │                               ├──▶ [ Redis ] (Caché & Message Broker)
         │                               └──▶ [ Obsidian Vault ] (Volumen persistente)
         │                               
         ├───▶ Celery Workers (Procesos en segundo plano 24/7)
         │          ├──▶ Backtesting & LangGraph Agent Loops
         │          └──▶ Cron Nocturno (Librarian Agent a las 03:00 UTC)
         │
         └───▶ / (Frontend) ──▶ [ Node.js Server / Nginx Static Bundle ]
```

### 2.3 Paso a Paso para Desplegar 24/7

#### Paso 1: Preparar el VPS
```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker y Docker Compose
sudo apt install -y docker.io docker-compose-plugin git ufw

# Configurar Firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

#### Paso 2: Clonar el Repositorio y Configurar Variables de Entorno
```bash
git clone https://github.com/arnaumartinezagentesia-bit/Agencia-automatizada.git /opt/agencia
cd /opt/agencia

# Crear archivo de entorno de producción
cp .env.example .env.prod
nano .env.prod
```
*En `.env.prod` colocas contraseñas seguras para Postgres/Redis, tus API Keys reales y configuras `ENV=production`.*

#### Paso 3: Lanzar con Docker Compose de Producción
En producción los contenedores tienen la directiva `restart: unless-stopped` para que si el servidor se reinicia o un proceso falla, Docker lo levante automáticamente:

```bash
docker compose -f docker-compose.prod.yml up -d
```

#### Paso 4: Configurar Nginx y Certificados SSL Gratuitos (HTTPS / WSS)
Instalamos Nginx y Certbot para tener dominio propio (ejemplo: `agencia.tudominio.com`):

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Configuración de Nginx (`/etc/nginx/sites-available/agencia`):
```nginx
server {
    server_name agencia.tudominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSockets en Tiempo Real
    location /ws {
        proxy_pass http://localhost:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```
Obtienes el certificado con:
```bash
sudo certbot --nginx -d agencia.tudominio.com
```

---

## 3. Monitorización y Control 24/7

Para garantizar que el sistema nunca se caiga o actúe fuera de control:

1. **Reinicio Automático (Auto-healing):**
   Docker vigila la salud de los contenedores (`healthcheck`). Si el backend o el worker se quedan sin memoria o lanzan un error no controlado, Docker los reinicia de inmediato en milisegundos.
2. **Alertas y Notificaciones (Telegram / Discord / Email):**
   El sistema incluye un canal de alerta para eventos críticos:
   - Notificación instantánea si el Risk Agent aplica un veto técnico.
   - Alerta si se produce un fallo de conexión con el proveedor de datos de mercado.
   - Alerta si la cuota de tokens de la API supera el 80% del presupuesto diario.
3. **Kill Switch Global:**
   En el panel frontend (y mediante un endpoint autenticado `POST /api/v1/system/emergency-stop`), existe un botón de parada de emergencia que pausa inmediatamente todas las tareas activas de los workers sin apagar la base de datos.
4. **Backups Automáticos Diarios:**
   Un script programado en el VPS realiza un volcado (`pg_dump`) de PostgreSQL y una copia comprimida de la carpeta `./obsidian_vault` hacia un almacenamiento seguro externo (ej. AWS S3 o Backblaze B2).

---

## 4. Resumen de Flujo de Trabajo

| Etapa | Dónde corre | Cómo se arranca | Cómo se observa |
|---|---|---|---|
| **Construcción & Testing** | Tu PC / Mac local | `docker compose -f docker-compose.dev.yml up` | `localhost:3000`, terminal de logs, Swagger `localhost:8000/docs`, Obsidian app local. |
| **Pase a Producción 24/7** | Servidor VPS Linux | `docker compose -f docker-compose.prod.yml up -d` | Dominio web con SSL (`https://...`), alertas de Telegram/Discord, logs en servidor. |
