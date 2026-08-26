# Agencia Automatizada

Agencia multiagente orientada al análisis y apoyo al trading, inicialmente centrada en el instrumento `XAUUSD`.

El proyecto combina:

- Un backend en Python/FastAPI.
- Persistencia prevista con PostgreSQL.
- Redis para necesidades de estado, coordinación o comunicación temporal.
- Un frontend visual en estilo Pixel Art.
- Comunicación en tiempo real mediante WebSockets.
- Agentes especializados en análisis de noticias, estrategias, lectura de mercado, riesgo, ejecución en paper trading y memoria.
- Una bóveda de conocimiento cualitativo en Obsidian.
- Backtesting determinista y trazable como núcleo cuantitativo.

> **Estado importante:** este repositorio se encuentra en fase de saneamiento, definición arquitectónica y construcción del núcleo del MVP. No debe interpretarse como una plataforma de trading lista para operar con dinero real.

## Alcance del MVP

El MVP está limitado inicialmente a `XAUUSD` y tiene como objetivo proporcionar apoyo analítico al operador.

Incluye como objetivos:

1. Análisis de noticias relacionadas con el mercado.
2. Generación de hipótesis y estrategias.
3. Validación mediante backtesting reproducible.
4. Lectura estructurada del mercado.
5. Supervisión determinista del riesgo.
6. Paper trading con un capital virtual inicial de `1.000 EUR`.
7. Visualización del estado de la agencia mediante el frontend.
8. Registro de decisiones, resultados y eventos relevantes.
9. Gestión de conocimiento cualitativo mediante Obsidian.

El MVP no pretende crear todavía bots autónomos de trading ni ejecutar operaciones reales.

## Funcionalidades fuera del MVP

Las siguientes capacidades quedan reservadas para fases posteriores:

- Ejecución con dinero real.
- Integración definitiva con un bróker.
- Sintetizador automático de Expert Advisors.
- Creación de EAs autónomos a partir de estrategias descubiertas.
- Soporte completo para múltiples activos y mercados.
- Acceso multiusuario.
- Integraciones externas no aprobadas explícitamente.
- Automatización de operaciones sin aprobación humana.
- Recomendaciones de inversión real sobre empresas u otros activos.

## Estado actual de implementación

El repositorio contiene una base inicial de arquitectura y prototipado, pero todavía no constituye un sistema de trading operativo.

### Componentes existentes

La estructura actual incluye:

```text
.
├── .claude/
├── Agents assistants/
├── docs/
├── docker/
├── nginx/
├── scripts/
├── src/
│   ├── backend/
│   │   ├── agents/
│   │   ├── api/
│   │   ├── core/
│   │   ├── services/
│   │   └── main.py
│   └── frontend/
│       ├── components/
│       ├── game/
│       ├── pages/
│       ├── public/
│       └── package.json
├── tests/
├── docker-compose.yml
├── Procfile
├── requirements.txt
└── .gitignore
```

### Componentes todavía en construcción

Antes de considerar estable el sistema, es necesario completar o validar, como mínimo:

- Motor de riesgo determinista centralizado.
- Persistencia transaccional en PostgreSQL.
- Migraciones de base de datos.
- Contratos formales de datos de mercado.
- Backtesting reproducible con costes, spread y slippage.
- Controlador de paper trading.
- Recibos de decisión de los agentes.
- Auditoría de eventos y operaciones.
- Protocolo versionado de WebSockets.
- Reconciliación del frontend mediante snapshots del backend.
- Curación y persistencia de memoria.
- Separación completa entre local, staging y producción.
- Pruebas de integración y pruebas de seguridad.
- Observabilidad y procedimientos de recuperación.

## Mocks y prototipos

Algunas partes del código actual son prototipos o contienen comportamiento simulado. No deben utilizarse como fuente de datos de mercado ni como evidencia de que una estrategia es rentable.

Entre los componentes que deben considerarse provisionales se encuentran:

- `src/backend/services/backtest_engine.py`
- `src/backend/services/market_data.py`
- El flujo de actualización de estados de agentes en `src/backend/main.py`
- Algunos agentes especialistas ubicados en `src/backend/agents/specialists/`
- `src/backend/services/telegram_bot.py`, cuya integración debe considerarse futura hasta que sea aprobada formalmente

Los datos simulados solo deben utilizarse en pruebas controladas y fixtures deterministas. Nunca deben presentarse en la interfaz como datos reales, operaciones ejecutadas o resultados financieros válidos.

El sistema debe distinguir explícitamente entre los siguientes modos:

- `unconfigured`
- `data_unavailable`
- `backtest`
- `paper`
- `real`

El modo `real` no forma parte del MVP.

## Arquitectura resumida

### Backend

El backend está organizado alrededor de FastAPI y contiene, de forma preliminar:

- `agents/`: agentes y especialistas.
- `api/`: endpoints HTTP y WebSocket.
- `core/`: estado, coordinación y almacenamiento interno.
- `services/`: servicios de mercado, backtesting e integraciones.
- `main.py`: punto de entrada de la aplicación.

El backend debe ser la fuente autoritativa del estado de la agencia, de las posiciones, de las operaciones, de los resultados y de los eventos.

### Frontend

El frontend se encuentra en `src/frontend/` y está orientado a una interfaz visual Pixel Art.

Su responsabilidad es:

- Mostrar el estado recibido del backend.
- Representar los departamentos y agentes.
- Visualizar noticias, análisis, resultados y alertas.
- Mostrar el estado de riesgo y de paper trading.
- Reconectarse y solicitar un snapshot cuando sea necesario.

El frontend no puede inventar estados, operaciones, balances ni resultados.

### PostgreSQL

PostgreSQL debe utilizarse como fuente de verdad para los datos estructurados, incluyendo, cuando estén implementados:

- Datos de mercado normalizados.
- Órdenes.
- Posiciones.
- Balance.
- Resultados de backtesting.
- Eventos de riesgo.
- Recibos de decisión.
- Auditoría.
- Estados persistentes de la agencia.

### Redis

Redis puede utilizarse para estado temporal, coordinación entre procesos, Pub/Sub, colas o eventos efímeros. Redis no sustituye a PostgreSQL como almacenamiento persistente principal.

### Obsidian

La bóveda de Obsidian está destinada exclusivamente al conocimiento cualitativo y estructurado de la agencia.

No deben almacenarse en Obsidian grandes volúmenes de velas históricas, balances como fuente autoritativa, órdenes o posiciones como fuente autoritativa, secretos, claves API o credenciales, ni datos financieros que deban consultarse de forma transaccional.

La bóveda prevista se encuentra en:

```text
./obsidian_vault
```

La captura de eventos en bruto debe mantenerse separada de las lecciones curadas. Las contradicciones entre lecciones deben conservarse como conflictos pendientes y no resolverse automáticamente por una puntuación de confianza.

## Principios de riesgo

La preservación de capital es una restricción arquitectónica, no una recomendación opcional.

Las reglas aprobadas para el MVP incluyen:

- Riesgo máximo por operación: `1%`.
- Pérdida diaria máxima: `2%`.
- Pérdida semanal máxima: `5%`.
- Drawdown total máximo: `10%`.
- Máximo de `2` posiciones simultáneas.
- Exposición máxima: `10%`.
- Apalancamiento: `0`; no permitido.
- Activación de un kill switch al alcanzar el límite diario.
- Bloqueo de nuevas operaciones después de activar el kill switch.
- Aprobación humana obligatoria para cambios sensibles y para cualquier eventual operación real.

Los cálculos de riesgo, tamaño de posición, exposición, drawdown, costes y métricas de backtesting deben ejecutarse mediante código determinista y testeable.

Los agentes basados en LLM pueden resumir noticias, proponer hipótesis, clasificar información y explicar resultados. No pueden sustituir al motor de riesgo, modificar los límites por iniciativa propia, ejecutar directamente órdenes ni presentar una hipótesis o un backtest no reproducible como una operación aprobada o estrategia rentable.

## Agentes del MVP

La organización funcional prevista comprende seis roles principales:

1. **Analista de noticias:** recopila y resume información relevante para el instrumento y el contexto de mercado.
2. **Estratega de backtesting:** formula hipótesis que deben ser evaluadas por un motor cuantitativo determinista.
3. **Lector de mercado:** analiza el estado del mercado utilizando datos disponibles y métodos definidos.
4. **Guardián de riesgo:** comprueba que las propuestas cumplen las restricciones mediante lógica determinista.
5. **Controlador de ejecución:** gestiona únicamente el flujo aprobado de paper trading y no puede saltarse el motor de riesgo.
6. **Curador de memoria:** organiza lecciones, resultados, errores y conocimiento cualitativo siguiendo las reglas de memoria.

Los agentes deben utilizar contratos de entrada y salida tipados, límites de herramientas, presupuestos de ejecución y recibos de decisión auditables.

## Skills de Claude Code

El catálogo de skills está organizado en:

```text
.claude/skills/
├── 00-core/
├── 01-backend/
├── 02-trading/
├── 03-frontend/
└── 04-operations/
```

Antes de desarrollar, Claude Code debe inspeccionar el catálogo actual y leer las instrucciones de las skills relevantes para la tarea concreta. Las skills archivadas son pasivas y no deben cargarse masivamente en el contexto.

La documentación del inventario y reorganización se encuentra en `docs/final_skill_tree.md`, `docs/skills_reorganization_table.md`, `docs/skills_reorg_validation_report.md`, `docs/skills_reorganization_manifest.csv` y `docs/skills_reorganization_manifest.json`.

## Documentación obligatoria

Antes de realizar cambios de código debe leerse y analizarse la documentación aplicable:

- `docs/architecture/AGENCIA_MASTER_ARCHITECTURE_SPEC.md`
- `docs/architecture/AGENT_TOKEN_EFFICIENCY_POLICY.md`
- `docs/architecture/DEPLOYMENT_AND_TESTING_GUIDE.md`
- `docs/architecture/CLAUDE_CODE_MASTER_INSTRUCTION_PROMPT.md`
- `docs/product/PRD_TRADING_MVP.md`
- `docs/trading/RISK_SPECIFICATION.md`
- `docs/trading/DATA_CONTRACTS.md`
- `docs/agents/AGENT_OPERATING_MODEL.md`
- `docs/agents/PERMISSIONS_MATRIX.md`
- `docs/memory/MEMORY_SPEC.md`
- `docs/deployment/ENVIRONMENTS_AND_DEPLOYMENT.md`
- Todos los ADR ubicados en `docs/architecture/adr/`

También deben revisarse, si existen, `docs/superpowers/specs/`, `Agents assistants/`, `AGENCY_SPECIFICATION.md` y `OBSIDIAN_MEMORY_SPEC.md`.

## Requisitos locales

Como base de desarrollo se requiere Git, Docker, Docker Compose, Python compatible con `requirements.txt`, Node.js y el gestor de paquetes compatible con `src/frontend/package.json`.

Las versiones exactas deben confirmarse en los archivos de configuración del proyecto antes de preparar el entorno.

## Arranque local con Docker

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Para ejecutarlo en segundo plano:

```bash
docker compose up --build -d
```

Para detenerlo:

```bash
docker compose down
```

El `docker-compose.yml` actual debe considerarse principalmente una base de desarrollo hasta completar el endurecimiento de seguridad y operación. No deben introducirse secretos directamente en el repositorio.

## Ejecución de tests

Los tests se encuentran en `tests/`. La ejecución estándar es:

```bash
pytest
```

Deben ampliarse progresivamente para cubrir `RiskEngine`, límites de riesgo, kill switch, backtesting reproducible, costes, idempotencia, persistencia, WebSockets, permisos y separación entre modos `backtest`, `paper` y `real`.

No se debe considerar una fase terminada únicamente porque el servidor arranque.

## Entornos

El proyecto debe mantener una separación clara entre local, staging y production.

Producción debe incorporar gestión segura de secretos, backups, restauración verificada, migraciones controladas, health checks, monitorización, rotación de logs, límites de recursos, acceso restringido a PostgreSQL y Redis, rollback y alertas para eventos críticos.

## Reglas para contribuir

Antes de modificar el código hay que leer la documentación relacionada, revisar los ADR aplicables, confirmar la fuente de verdad, identificar impactos sobre riesgo, agentes, memoria o WebSockets, y crear o actualizar tests.

No se debe introducir lógica de negocio en el frontend, datos simulados en rutas operativas ni secretos en el repositorio. Los cambios que modifiquen decisiones aprobadas deben documentarse mediante un nuevo ADR o una actualización controlada.

## Prioridad recomendada de desarrollo

1. Saneamiento del repositorio.
2. Validación de documentación y rutas.
3. Confirmación del inventario real de skills.
4. Contratos de datos de mercado.
5. Protocolo de backtesting.
6. Implementación del `RiskEngine`.
7. Persistencia y migraciones.
8. Paper trading controlado.
9. Recibos de decisión y auditoría.
10. Protocolo WebSocket.
11. Integración de agentes.
12. Integración de memoria.
13. Integración completa del frontend.
14. Staging.
15. Hardening y operación 24/7.

No se debe avanzar hacia ejecución real hasta validar el núcleo determinista, la auditoría, los controles de riesgo, la persistencia y las pruebas.

## Advertencia de seguridad

Este proyecto se relaciona con mercados financieros y puede implicar riesgo económico.

Nada de este repositorio debe interpretarse como garantía de rentabilidad ni como autorización para operar con dinero real.

Hasta que exista una implementación validada y una aprobación explícita:

- No conectar un bróker real.
- No almacenar credenciales reales.
- No habilitar ejecución real.
- No presentar resultados simulados como resultados financieros.
- No eliminar controles de riesgo.
- No permitir que un agente modifique sus propias restricciones.
- No omitir la aprobación humana de acciones sensibles.
