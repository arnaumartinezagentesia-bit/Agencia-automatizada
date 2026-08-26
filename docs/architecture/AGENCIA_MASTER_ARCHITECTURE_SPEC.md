# Agencia Automatizada — Especificación Maestra de Arquitectura y Ejecución

**Estado:** Propuesta canónica para validar antes de desarrollo  
**Audiencia:** Claude Code, Hermes Agent y colaboradores técnicos  
**Objetivo:** Esta especificación consolida las decisiones necesarias para construir la Agencia Multi‑Agente Autónoma de forma segura, observable, extensible y reproducible. Cuando contradiga documentos anteriores, prevalece sobre ellos tras ser aprobada por el propietario del proyecto.

## 1. Misión, principio rector y alcance

La Agencia Automatizada es una plataforma multiagente por departamentos. Su primer vertical es **Trading**. Los departamentos futuros —Dropshipping, Contenido/YouTube e Incubadora— deben poder reutilizar el núcleo técnico sin obligar a rediseñarlo.

La plataforma debe ofrecer:

- un backend operativo con FastAPI;
- workflows de agentes orquestados con LangGraph;
- frontend de operaciones Pixel Art basado en eventos reales (Canvas/Phaser.js y Tailwind);
- memoria humana y curada en una bóveda única de Obsidian;
- trazabilidad completa de decisiones, herramientas, datos y resultados;
- límites de seguridad con prioridad absoluta sobre autonomía o rentabilidad.

### 1.1 Regla no negociable: preservación de capital

En Trading, la preservación de capital prevalece sobre retorno, autonomía, velocidad y preferencias de cualquier LLM. Un LLM puede proponer, resumir o explicar. Nunca puede saltarse una validación cuantitativa, fabricar una aprobación de riesgo ni alterar los resultados de un motor determinista.

La primera versión de Trading debe ser **análisis, generación de estrategia, backtesting, evaluación de riesgo y recomendación**. No debe enviar órdenes reales a un broker. La ejecución automatizada se considera una fase posterior, sujeta a una ADR y pruebas adicionales.

## 2. Instrucciones obligatorias para el agente de desarrollo

Antes de editar o crear código, Claude Code debe:

1. Leer el repositorio completo y, de forma obligatoria, todos los documentos de:
   - `docs/superpowers/specs/`
   - `Agents assistants/`
   - `.claude/skills/` relevantes para la tarea
   - `AGENCY_SPECIFICATION.md` y `OBSIDIAN_MEMORY_SPEC.md`, si existen en la raíz.
2. Crear un inventario breve de documentos, módulos, rutas y contradicciones detectadas.
3. Leer esta especificación y tratarla como arquitectura objetivo, una vez aprobada.
4. No implementar una funcionalidad de forma especulativa: primero localizar contratos existentes, modelos, configuraciones, pruebas y dependencias que la afecten.
5. Proponer un plan pequeño, verificable y por fases antes de realizar cambios grandes.
6. Ejecutar pruebas, análisis estático y comprobaciones de formato aplicables después de cada cambio significativo.
7. Documentar cualquier decisión que altere contratos, seguridad, persistencia, flujos de agentes o despliegue mediante un ADR.

### 2.1 Preguntas bloqueantes antes de comenzar el MVP

Si estas respuestas no constan de forma explícita en una ADR aprobada, el agente debe preguntar y no asumirlas:

1. ¿Qué activos son prioritarios para Trading MVP: `XAU/USD`, criptomonedas, forex, acciones u otros?
2. ¿Cuáles son el proveedor, licencia, granularidad, zona horaria y calendario de los datos históricos?
3. ¿El MVP es monousuario o requiere usuarios, roles y espacios de trabajo desde su primera versión?
4. ¿Cuál es el framework definitivo del frontend: React/Next.js con Phaser.js, u otra alternativa concreta?
5. ¿Qué acciones requieren aprobación humana explícita?
6. ¿Cuál es el límite inicial de riesgo por operación, exposición agregada, drawdown y apalancamiento?
7. ¿Qué modelo de trabajo asíncrono se adopta y cómo se desplegará en el VPS?

Mientras una decisión esté pendiente, usar una interfaz de configuración o un placeholder explícito; nunca inventar valores financieros, fuentes de datos, credenciales, esquemas de proveedores ni reglas de negocio.

## 3. Arquitectura canónica

### 3.1 Principios técnicos

1. **LLM para razonamiento; motores deterministas para cálculo y control.**
2. **PostgreSQL es la fuente de verdad operacional.**
3. **Redis solo contiene estado efímero, caché, locks, rate limits, pub/sub y coordinación.**
4. **Obsidian conserva conocimiento explicable y curado; no es una base transaccional.**
5. **La comunicación entre agentes usa contratos estructurados y versionados, no prosa libre.**
6. **Todo proceso importante debe ser reproducible, auditable e idempotente cuando sea posible.**
7. **El frontend muestra eventos reales del backend; no simula actividad.**
8. **Los agentes operan con mínimo privilegio: herramientas, memoria y permisos explícitamente autorizados.**

### 3.2 Componentes

| Capa | Responsabilidad |
|---|---|
| Frontend | Oficina Pixel Art, paneles de trabajo, trazas y aprobaciones humanas. |
| API FastAPI | Autenticación, API HTTP, WebSockets, validación de requests, autorización y lectura de resultados. |
| Orquestador LangGraph | Define estados, rutas, pausas humanas, reintentos seguros y coordinación entre agentes. |
| Agentes LLM | Interpretan solicitudes, generan hipótesis y resúmenes; solo producen outputs validados por esquema. |
| Motores deterministas | Validación de parámetros, backtesting, cálculos de riesgo, políticas, reglas de promoción. |
| Workers | Ejecutan tareas lentas y programadas fuera del proceso HTTP. |
| PostgreSQL | Entidades operativas, auditoría, ejecuciones, artefactos, políticas y resultados. |
| Redis | Cola/coordinar workers según tecnología elegida, pub/sub de eventos, caché, locks y presencia. |
| Obsidian Vault | Conocimiento curado, decisiones, lecciones y reglas humanas legibles. |
| Observabilidad | Logs estructurados, métricas, trazas, alertas y correlación de ejecución. |

### 3.3 Separación de responsabilidades de datos

| Dato | Ubicación canónica |
|---|---|
| Usuarios, permisos y sesiones | PostgreSQL / proveedor de identidad aprobado |
| Estrategias, versiones, backtests y evaluación de riesgo | PostgreSQL |
| Decisiones de comité, aprobaciones y auditoría | PostgreSQL |
| Estados de jobs, locks, pub/sub y caché | Redis |
| Eventos de interfaz en tiempo real | Redis pub/sub o bus aprobado; persistir eventos relevantes en PostgreSQL |
| Notas, lecciones y reglas curadas | `./obsidian_vault` |
| Logs brutos de memoria | `./obsidian_vault/99_raw_logs/` |
| Secretos | Variables de entorno o gestor de secretos; nunca Git, PostgreSQL, Redis u Obsidian |

## 4. Arquitectura de agentes

### 4.1 Manifiestos de agente

Los agentes no deben duplicarse como bloques de código aislados. Cada uno debe definirse mediante un manifiesto o configuración validada que incluya, como mínimo:

- `agent_id`;
- departamento;
- propósito y límites explícitos;
- tipos de entrada y salida;
- herramientas permitidas;
- namespaces de memoria permitidos;
- modelo y configuración de inferencia;
- política de reintentos y presupuesto;
- eventos emitidos;
- requisitos de aprobación humana;
- permisos y política de riesgo aplicable.

El orquestador, API y frontend deben poder consultar esta definición sin duplicar su información.

### 4.2 Oficina de Trading

| Agente | ID | Responsabilidad | Prohibiciones |
|---|---|---|---|
| Director | `trading_desk_lead` | Orquestar el comité y emitir dictamen trazable. | No calcular métricas ni eludir un veto. |
| Estrategia | `trading_strategy_agent` | Traducir tesis a una plantilla y parámetros estructurados. | No inventar reglas ni aceptar parámetros inválidos. |
| Backtest | `trading_backtest_agent` | Preparar y explicar solicitudes/resultados del motor. | No calcular o modificar resultados por LLM. |
| Riesgo | `trading_risk_management_agent` | Presentar evaluación del motor de riesgo. | No aprobar sin motor determinista. |
| Inteligencia de mercado | `trading_market_intelligence_agent` | Recopilar y resumir información de mercado y eventos. | No emitir una orden ni operar sin fuentes trazables. |
| Journal | `trading_journal_agent` | Registrar decisiones, expectativa y resultado posterior. | No recomendar ni ejecutar operaciones. |
| Librarian | `librarian_agent` | Curar logs en memoria bajo política de promoción. | No modificar reglas inmutables ni promover datos no confiables. |

### 4.3 Flujo de comité y máquina de estados

La máquina de estados debe implementarse en LangGraph y/o servicios deterministas, no solo describirse en prompts:

```text
draft_strategy
  -> validated_strategy
  -> backtest_requested
  -> backtest_completed
  -> risk_assessed
  -> committee_decision
  -> approved_for_recommendation | rejected | needs_human_review
```

`approved_for_execution` queda reservado para una fase futura. Solo puede existir si hay una ADR aprobada, integración de broker aislada, credenciales seguras, pruebas de entorno simulado y un motor de políticas que apruebe la transición.

Una decisión de riesgo negativa o incompleta conduce obligatoriamente a `rejected` o `needs_human_review`. El Director no puede redirigir esa transición mediante lenguaje natural.

## 5. Contratos estructurados y versionado

Definir modelos Pydantic versionados. Los nombres concretos pueden ajustarse al código existente, pero deben representar estas responsabilidades:

- `StrategySpec`;
- `BacktestRequest`;
- `BacktestResult`;
- `RiskAssessment`;
- `MarketSnapshot`;
- `MarketAlert`;
- `CommitteeDecision`;
- `AgentExecutionLog`;
- `MemoryPromotionCandidate`.

Cada contrato debe tener:

- `schema_version`;
- identificadores únicos;
- fecha/hora en UTC;
- procedencia de datos y versiones;
- campos de estado; y
- errores estructurados cuando aplique.

Nunca pasar JSON no validado, texto ambiguo o campos inventados entre agentes. Las salidas LLM se validan; si no cumplen esquema, se registran como fallo controlado y se reintentan o escalan según política.

## 6. Motores deterministas de Trading

### 6.1 Registro y validación de estrategias

`StrategyTemplateRegistry` define las plantillas permitidas. `ParameterSchemaValidator` comprueba tipos, rangos, campos requeridos, combinaciones inválidas y versión de plantilla antes de backtesting.

No se aceptan estrategias ejecutables generadas libremente por un LLM. El LLM solo selecciona y parametriza plantillas registradas, con explicación al usuario.

### 6.2 Motor de backtesting

El motor de backtesting debe ser independiente de los agentes LLM y recibir únicamente una solicitud validada. Debe persistir:

- versión de estrategia y parámetros;
- identificador, versión, rango temporal y zona horaria de datos;
- semilla si existe aleatoriedad;
- costes, spread, slippage y financiación aplicados;
- reglas exactas de entrada y salida;
- métricas, curva de equity y operaciones;
- errores y calidad de datos.

Debe proteger contra *look-ahead bias*, usar datos disponibles en cada instante, identificar huecos, definir calendario/sesión y evitar optimización sobre el mismo periodo de evaluación. Cualquier optimización futura debe soportar separación entrenamiento-validación-prueba y evaluación walk-forward.

Un resultado con rentabilidad positiva no prueba robustez. La política de calidad debe considerar, como mínimo, tamaño de muestra, drawdown, estabilidad, costes, resultado fuera de muestra y benchmark definido.

### 6.3 Motor de riesgo y veto técnico

El `RiskCalculatorEngine` calcula de manera reproducible, con parámetros explícitos:

- tamaño de posición;
- riesgo monetario y porcentual;
- relación riesgo/beneficio;
- exposición agregada;
- correlación o concentración cuando aplique;
- apalancamiento;
- stop-loss y volatilidad/ATR cuando se use;
- drawdown actual y proyectado;
- cumplimiento de límites de política.

La salida incluye `status: approved | rejected | needs_review`, razones codificadas y entradas utilizadas. Solo `approved` permite una recomendación marcada como apta. El motor de políticas, no el Director ni el prompt, aplica la transición.

## 7. Memoria viva de Obsidian

### 7.1 Estructura de bóveda

```text
obsidian_vault/
├── 00_raw_inputs/
├── 00_core_shared/
│   ├── VAULT_RULES.md
│   ├── architecture_decisions/
│   └── shared_knowledge/
├── 01_office_trading/
│   ├── strategies/
│   ├── market_intelligence/
│   ├── journals/
│   └── lessons/
├── 02_office_dropshipping/
├── 03_office_content/
├── 04_office_incubator/
└── 99_raw_logs/
```

La estructura concreta existente debe migrarse de forma no destructiva. Antes de mover archivos, crear inventario, plan de migración, copias y enlaces/redirecciones cuando sean útiles.

### 7.2 Captura de memoria bruta

Cada ejecución relevante escribe un log JSON inmutable en `99_raw_logs/` con identificador, timestamps UTC, agente, workflow, `trace_id`, entradas/salidas resumidas, `searches_made`, `sources_consulted`, `errors_encountered`, `uncaught_exceptions`, `profit_metric` cuando aplique, duración, artefactos y aprendizaje propuesto.

Los logs brutos no se introducen automáticamente en el contexto de agentes.

### 7.3 Curación nocturna y niveles de confianza

El Librarian se ejecuta por un scheduler separado y realiza deduplicación, clasificación, enlace y propuesta de promoción. No debe ser un proceso destructivo.

Niveles:

1. **Reglas inmutables:** solo administración y control de cambios.
2. **Reglas promovidas:** requieren evidencia, versión, fecha, procedencia y aprobación humana o una política determinista aprobada.
3. **Conocimiento curado:** recuperable por relevancia, oficina y confianza.
4. **Datos brutos/no confiables:** aislados; nunca incluidos directamente en prompts.

Toda nota promovida debe contener procedencia hacia logs o artefactos de PostgreSQL. Cada ejecución debe registrar qué notas fueron recuperadas y usadas.

### 7.4 Defensa ante prompt injection

Contenido procedente de web, usuarios, herramientas o logs no es una instrucción de sistema. Debe etiquetarse como dato no confiable. La recuperación RAG devuelve contenido delimitado, con fuente y nivel de confianza; el agente no debe obedecer instrucciones incluidas dentro de documentos recuperados.

## 8. Observabilidad y auditoría

Toda tarea posee `task_id` y `trace_id`. Registrar de forma estructurada:

- agente, workflow y estado;
- versión de prompt, manifiesto, modelo y herramienta;
- entradas y salidas validadas;
- memoria recuperada;
- datos y versiones usados;
- validaciones y decisiones de política;
- duración, coste, tokens, reintentos y errores;
- aprobación humana, usuario y timestamp cuando exista.

El frontend debe permitir recorrer una ejecución desde una decisión hasta sus artefactos, validaciones y fuentes. No exponer secretos, datos sensibles ni cadenas de razonamiento privadas.

## 9. Frontend de operaciones

La interfaz puede combinar React/Next.js, Phaser.js y Tailwind únicamente tras confirmar la ADR de frontend. La separación requerida es:

- **mundo Pixel Art / Canvas:** representación espacial de agentes y estados;
- **paneles Tailwind:** tareas, artefactos, explicaciones, aprobaciones, logs y configuración;
- **WebSocket:** entrega de eventos de estado reales;
- **HTTP:** consulta de históricos y comandos validados.

Estados visuales mínimos y su fuente:

| Visual | Evento real |
|---|---|
| `IDLE` | Sin tarea activa. |
| `THINKING` | Planificación o espera legítima. |
| `WORKING` | Job o herramienta en ejecución. |
| `COLLABORATING` | Participación en workflow multiagente. |
| `ALERT` | Error, límite, veto o evento crítico. |
| `SUCCESS` | Artefacto validado o tarea finalizada. |

La UI nunca debe presentar una recomendación como aprobada cuando el motor de riesgo indique lo contrario.

## 10. Seguridad, permisos y operación

- Nunca incluir secretos en código, logs, prompts, Obsidian o frontend.
- Usar configuración por entorno y un gestor de secretos o variables protegidas.
- Definir RBAC antes de exponer acciones multiusuario.
- Aplicar autorización por endpoint, herramienta, agente y oficina.
- Proteger WebSockets con autenticación y autorización.
- Aplicar rate limits, timeouts, límites de coste, cuotas y circuit breakers.
- Mantener entornos separados: local, staging y producción.
- Crear un kill switch global para detener workers, workflows autónomos y futuras integraciones externas.
- Registrar acciones sensibles de forma inmutable y con identidad del actor.

## 11. Estrategia de pruebas y calidad

Cada capa debe tener pruebas apropiadas:

- unitarias para contratos, validadores, políticas, motores y utilidades;
- integración para PostgreSQL, Redis, API, WebSockets y workers;
- fixtures reproducibles de datos de mercado;
- tests de flujo para LangGraph, incluidos vetos y errores;
- contract tests entre frontend, API y eventos;
- pruebas de migración y recuperación de memoria;
- pruebas de seguridad de autorización, secretos y entradas no confiables.

Los tests de riesgo y backtest deben cubrir explícitamente rechazo por parámetros inválidos, datos incompletos, costes, límite de drawdown, pérdida máxima, transiciones prohibidas y resultados reproducibles.

## 12. Plan de construcción por fases

### Fase 0 — Congelación de arquitectura

- Crear ADRs para frontend, jobs/worker, memoria, autenticación, datos de mercado y alcance de ejecución.
- Resolver preguntas bloqueantes.
- Consolidar esta especificación con documentos existentes sin borrar evidencia histórica.

**Criterio de salida:** decisiones aprobadas y sin contradicciones arquitectónicas abiertas.

### Fase 1 — Núcleo de plataforma

- Configuración tipada, entornos, secretos, Docker y health checks.
- PostgreSQL, migraciones, Redis y estructura base FastAPI.
- Identidad/roles si el MVP los necesita.
- Logging estructurado, `trace_id` y esqueleto de eventos.

**Criterio de salida:** servicio desplegable, migrable y observable localmente.

### Fase 2 — Contratos y motores deterministas

- Modelos Pydantic versionados.
- Registro de estrategias y validador.
- Motor de backtest reproducible con datos de prueba.
- Motor de riesgo, política y veto técnico.

**Criterio de salida:** una estrategia válida puede pasar por validación, backtest y riesgo sin LLM; un rechazo bloquea el flujo en pruebas.

### Fase 3 — Workflows y agentes de Trading

- Manifiestos de agentes.
- Agents de Estrategia, Backtest y Riesgo como adaptadores de contratos/herramientas.
- LangGraph con estados, errores, auditoría y pausas humanas.
- Director que agrega resultados sin modificar evidencia determinista.

**Criterio de salida:** flujo end-to-end trazable que genera una recomendación o rechazo estructurado.

### Fase 4 — Inteligencia, Journal y memoria

- Ingesta de mercado trazable y aislada de instrucciones.
- Journal Agent y vínculos entre decisión y resultados.
- Logs JSON, Librarian programado, RAG con niveles de confianza.

**Criterio de salida:** ejecución registrada, curación no destructiva y recuperación auditada.

### Fase 5 — API, WebSockets y UI operativa

- Endpoints de artefactos y estados.
- Publicación de eventos reales.
- UI textual funcional y panel de trazas.

**Criterio de salida:** usuario puede observar decisiones y vetos en tiempo real sin Pixel Art.

### Fase 6 — Oficina Pixel Art

- Integrar Canvas/Phaser y Tailwind sobre el contrato de eventos ya estable.
- Representar estados reales, accesibilidad y fallback no gráfico.

**Criterio de salida:** toda animación es explicable por un evento persistido.

### Fase 7 — Expansión de departamentos

- Solo tras validar Trading MVP.
- Crear manifiestos, contratos, QualityPolicy y memoria de cada oficina antes de agentes concretos.

## 13. ADRs mínimos requeridos

Crear documentos versionados bajo `docs/architecture/adr/`:

1. arquitectura canónica y tecnologías elegidas;
2. fuente de verdad y límites PostgreSQL/Redis/Obsidian;
3. framework frontend y protocolo de eventos;
4. workers, scheduler y jobs asíncronos;
5. datos de mercado y reproducibilidad de backtesting;
6. política de riesgo y veto técnico;
7. autenticación, autorización y gestión de secretos;
8. memoria, RAG y defensa ante prompt injection;
9. alcance y condiciones para una futura ejecución real.

## 14. Criterios de aceptación globales

La primera entrega de Trading se considera correcta únicamente si:

- no existe ruta que permita una recomendación aprobada tras un veto del motor de riesgo;
- cualquier backtest relevante es reproducible con datos, versión y costes identificables;
- los contratos entre componentes se validan y versionan;
- cada workflow es trazable mediante `trace_id`;
- Obsidian no contiene secretos ni actúa como estado transaccional;
- las memorias no confiables no se obedecen como instrucciones;
- el frontend refleja eventos reales del backend;
- las pruebas cubren tanto casos válidos como rechazos, errores y transiciones bloqueadas;
- no se han activado órdenes reales ni credenciales de broker.

## 15. Gestión de documentación existente

No eliminar documentación previa de forma automática. Primero comparar, extraer decisiones valiosas y registrar las diferencias. Esta especificación debe convertirse en el punto de entrada técnico único, enlazando a documentos especializados en lugar de duplicar detalles.

La documentación que sea puramente exploratoria, obsoleta o contradictoria debe moverse a `docs/archive/` con una cabecera que indique: fecha, motivo de sustitución y documento canónico que la reemplaza. Las especificaciones detalladas por agente pueden mantenerse como anexos si sus contratos no contradicen este documento.

---

## Apéndice A — Regla de trabajo

La perfección operativa no se consigue construyendo todos los departamentos a la vez. Se consigue validando un camino de negocio estrecho, reproducible y seguro —Trading MVP sin ejecución real— y reutilizando después sus contratos, observabilidad, políticas y memoria en los demás departamentos.
