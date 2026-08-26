# Política de Eficiencia de Tokens para Agentes

**Estado:** Especificación de implementación propuesta  
**Audiencia:** Claude Code, agentes de la Agencia Automatizada y mantenedores  
**Complementa:** `AGENCIA_MASTER_ARCHITECTURE_SPEC.md`  
**Principio:** Reducir tokens inútiles sin degradar fiabilidad, seguridad, trazabilidad ni calidad de decisión.

## 1. Propósito

Esta política define cómo deben diseñarse y operar los agentes para que cada interacción use el mínimo contexto y el mínimo número de llamadas que permitan completar la tarea correctamente.

El ahorro de tokens **sí es posible**, pero no debe aplicarse mediante recortes ciegos. Eliminar información crítica puede empeorar resultados, generar reintentos, aumentar el coste final y poner en riesgo la agencia. Por ello, el sistema debe usar presupuestos adaptativos: contexto breve por defecto y escalado controlado cuando la complejidad, la incertidumbre o el riesgo lo justifiquen.

La optimización busca reducir:

- tokens de entrada repetidos;
- tokens de salida innecesariamente largos;
- llamadas LLM evitables;
- recuperación de memoria irrelevante;
- serialización de datos masivos en prompts;
- bucles, reintentos y conversaciones entre agentes sin valor operativo.

No busca reducir:

- validaciones deterministas;
- controles de riesgo;
- auditoría esencial;
- información necesaria para decisiones de alto impacto;
- pruebas ni observabilidad.

## 2. Reglas no negociables

1. **Nunca sustituir un cálculo determinista por un LLM para ahorrar tokens.** Backtests, riesgo, validación, transiciones de estado y políticas se ejecutan mediante motores deterministas.
2. **Nunca omitir el veto de riesgo ni la validación de esquemas.** La eficiencia no justifica una decisión menos segura.
3. **No reenviar todo el historial, la vault o el estado completo a cada llamada.** Recuperar solo lo pertinente.
4. **No delegar a un LLM si una regla, consulta de base de datos, caché o herramienta puede resolver la tarea.**
5. **No pedir a múltiples agentes que resuelvan el mismo problema salvo que la política requiera contraste.**
6. **Toda salida entre agentes debe ser estructurada, limitada y validada.**
7. **El sistema debe escalar el presupuesto cuando exista alto riesgo, baja confianza, conflicto entre fuentes o fallo de validación.**
8. **No sacrificar trazabilidad:** se almacenan referencias y artefactos; no es necesario repetirlos completos en prompts.

## 3. Modelo operativo: determinismo primero, LLM bajo demanda

Cada solicitud debe atravesar este orden de decisión:

```text
Evento o solicitud
  -> normalización y validación ligera
  -> ¿existe respuesta determinista, caché válida o artefacto reutilizable?
      -> sí: devolver o ejecutar sin LLM
      -> no: clasificar intención, riesgo y complejidad
          -> recuperar contexto mínimo relevante
          -> llamar al agente adecuado con presupuesto adaptativo
          -> validar salida estructurada
          -> ejecutar motores/herramientas deterministas necesarios
          -> persistir artefactos y resumen
```

Un LLM se usa para razonamiento semántico, planificación acotada, síntesis, interpretación de una petición humana o generación de una hipótesis dentro de una plantilla permitida. No se usa como base de datos, calculadora, mecanismo de colas, verificador de permisos ni orquestador de estados críticos.

## 4. Presupuesto adaptativo de tokens

### 4.1 Perfiles de tarea

Cada manifiesto de agente debe declarar perfiles de presupuesto, no un único prompt de tamaño fijo.

| Perfil | Uso | Contexto | Salida | Ejemplos |
|---|---|---:|---:|---|
| `micro` | Clasificación, extracción o enrutamiento simple | mínimo | muy breve / JSON | clasificar intención, elegir plantilla |
| `standard` | Tarea normal con evidencia suficiente | selectivo | estructurada y concisa | crear `StrategySpec`, resumir un resultado |
| `extended` | Ambigüedad o varias fuentes relevantes | ampliado de forma explícita | detallada | comparación de hipótesis, decisión de comité |
| `critical` | Alto impacto, conflicto o revisión humana | evidencia completa autorizada | trazable y prudente | análisis previo a recomendación de Trading |

Los valores numéricos exactos de tokens no deben fijarse en esta política sin conocer proveedor, modelo y precios. Deben parametrizarse por entorno y medirse con telemetría.

### 4.2 Reglas para escalar presupuesto

Subir de perfil solo si se cumple una condición observable:

- la validación del output falla;
- faltan campos esenciales;
- la confianza estimada es inferior al umbral definido;
- existen fuentes contradictorias;
- el motor de riesgo devuelve `needs_review`;
- el usuario pide expresamente profundidad adicional;
- una política del dominio requiere evidencia adicional.

Bajar de perfil si la tarea se resuelve mediante caché, datos estructurados, plantilla cerrada o regla determinista.

## 5. Diseño de contexto mínimo

### 5.1 Composición obligatoria del prompt

Cada llamada debe componerse únicamente de:

1. instrucciones estables del rol y límites del agente;
2. contrato de entrada/salida aplicable;
3. datos de la tarea actual;
4. memoria recuperada y relevante;
5. referencias a artefactos, no duplicados completos;
6. formato de respuesta requerido.

No incluir por defecto:

- historiales completos de conversación;
- documentos enteros de Obsidian;
- logs masivos;
- resultados crudos completos de backtest;
- definiciones de todos los agentes;
- instrucciones de otros departamentos;
- documentación técnica no requerida por la tarea.

### 5.2 Contexto estable y cacheable

Mantener al inicio del prompt, y con contenido idéntico cuando sea posible:

- reglas de seguridad del agente;
- política de riesgo aplicable;
- definición de contrato;
- instrucciones de salida;
- identidad y límites del agente.

Esto permite usar mecanismos de caché de prefijo si el proveedor/modelo elegido los soporta. La implementación no debe asumir una API de caché concreta: debe encapsularse en el adaptador del proveedor y medirse mediante telemetría.

Cambiar repetidamente el orden o redactado de esas instrucciones reduce la posibilidad de reutilización de prefijos.

### 5.3 Referencias en lugar de duplicación

Los artefactos persistidos deben identificarse por ID, versión, resumen y ubicación autorizada. Por ejemplo, un Director recibe las métricas necesarias y el identificador de `BacktestResult`, no miles de filas OHLCV ni el log completo del motor.

Si el agente necesita ampliar información, utiliza una herramienta con consulta acotada por ID y campos. Nunca se inyecta un dataset masivo por defecto.

## 6. Recuperación de memoria eficiente y segura

### 6.1 Recuperación selectiva

La búsqueda de memoria debe filtrar antes de generar contexto por:

- oficina o departamento;
- tipo de conocimiento;
- permisos;
- nivel de confianza;
- versión/vigencia;
- entidad o activo relacionado;
- relevancia semántica;
- límite explícito de resultados y caracteres.

El sistema debe recuperar primero títulos, metadatos y resúmenes. Solo obtiene el contenido completo de una nota si es necesario y autorizado.

### 6.2 Jerarquía de memoria

Orden de uso recomendado:

1. reglas inmutables relevantes;
2. políticas deterministas y configuración de dominio;
3. artefactos recientes de PostgreSQL;
4. conocimiento curado de alta confianza;
5. resúmenes de sesiones anteriores;
6. datos brutos únicamente bajo solicitud explícita y aislamiento.

Los logs de `99_raw_logs/`, contenido web y datos no confiables no se incorporan como instrucciones. Se tratan como evidencia delimitada, con procedencia y nivel de confianza.

### 6.3 Resúmenes de sesión

En workflows largos, generar un resumen estructurado al cierre de cada fase, no en cada mensaje. El resumen debe contener:

- objetivo;
- decisiones tomadas y razones;
- IDs de artefactos;
- estado actual;
- bloqueos;
- próximos pasos autorizados;
- información que no debe perderse.

El siguiente agente recibe el resumen y referencias, no la transcripción completa. Los resúmenes se validan y versionan para impedir la pérdida silenciosa de restricciones críticas.

## 7. Comunicación eficiente entre agentes

### 7.1 Eventos y contratos, no chat libre

Los agentes se coordinan preferentemente con eventos y modelos Pydantic versionados: `StrategySpec`, `BacktestRequest`, `BacktestResult`, `RiskAssessment`, `MarketSnapshot`, `CommitteeDecision` y equivalentes aprobados.

Una comunicación debe contener solo los campos que el receptor necesita. Todo campo adicional debe justificarse por contrato.

### 7.2 Patrón de delegación

Antes de delegar, el Director debe comprobar:

1. si el resultado ya existe y sigue vigente;
2. si una herramienta determinista resuelve el requisito;
3. qué agente es propietario único de la tarea;
4. qué entrada mínima necesita;
5. qué condición de finalización y esquema de salida aplican.

No iniciar paneles de múltiples agentes para una tarea simple. El contraste paralelo se reserva para casos definidos por política: fuentes contradictorias, alta incertidumbre, revisión crítica o aprobación humana.

### 7.3 Limitar iteraciones

Cada workflow define:

- número máximo de reintentos por fase;
- condiciones exactas de reintento;
- condición de escalado a humano;
- timeout;
- presupuesto acumulado;
- razón codificada de detención.

Está prohibido el intercambio indefinido de mensajes entre agentes. Si una salida no valida tras los reintentos permitidos, el workflow termina en `needs_human_review` o `failed_controlled`, con evidencia suficiente para diagnosticarlo.

## 8. Salidas LLM concisas y verificables

### 8.1 Formato por defecto

Los agentes deben devolver JSON validable o una respuesta estructurada definida por contrato. La explicación humana se genera como campo opcional y con un límite de longitud apropiado a la interfaz.

Ejemplo conceptual:

```json
{
  "schema_version": "1.0",
  "status": "ready_for_validation",
  "artifact_id": "...",
  "summary": "Resumen breve y factual.",
  "assumptions": ["..."],
  "missing_information": [],
  "next_action": "validate_parameters"
}
```

No solicitar ensayos, razonamientos extensos ni repeticiones del input cuando el consumidor sea otro servicio. Cuando se necesite explicar al usuario, elaborar la explicación desde el artefacto ya validado y bajo demanda.

### 8.2 Razonamiento interno y trazabilidad

No almacenar ni mostrar cadenas de razonamiento privadas. Para auditoría, conservar hechos observables: inputs, fuentes, herramientas, salidas estructuradas, validaciones, políticas aplicadas, errores y referencias a artefactos.

## 9. Caché, reutilización e idempotencia

### 9.1 Qué puede reutilizarse

Se puede reutilizar una salida solo si su clave incluye la versión de los elementos que afectan al resultado, por ejemplo:

- contrato y prompt/manifiesto del agente;
- estrategia y parámetros;
- versión y rango de datos;
- política de riesgo;
- fuente y timestamp de mercado;
- permisos y contexto de usuario cuando afecten el resultado.

Candidatos típicos:

- clasificación de intención;
- normalización de solicitudes;
- resúmenes de artefactos inmutables;
- resultados de validación;
- backtests con misma configuración y dataset versionado;
- consultas de memoria con política de caducidad;
- metadatos de plantillas y manifiestos.

### 9.2 Qué no debe reutilizarse sin control

No reutilizar ciegamente:

- snapshots de mercado sensibles al tiempo;
- decisiones de riesgo dependientes de estado actual;
- permisos/autorización;
- respuestas con datos personales o de un workspace distinto;
- resultados producidos con una política o versión de datos ya obsoleta.

Toda caché necesita TTL, clave de versión, invalidación y registro de `cache_hit`/`cache_miss`.

## 10. Herramientas y datos grandes

1. Consultar primero agregados, metadatos y muestras; ampliar bajo demanda.
2. Aplicar filtros, paginación, límites y selección de campos a toda herramienta.
3. Transformar datos grandes en artefactos persistidos y métricas estructuradas antes de pasar información a un LLM.
4. Entregar al LLM las conclusiones y estadísticas necesarias; conservar los datos completos para inspección por ID.
5. Truncar de forma segura resultados de herramientas y marcar toda truncación en la salida.
6. No repetir llamadas idénticas dentro del mismo `trace_id` salvo invalidación justificada.

En Trading, el motor recibe OHLCV y calcula resultados; el LLM recibe métricas, calidad de datos, curva resumida, muestras pertinentes y referencias. El LLM no procesa por defecto series históricas completas.

## 11. Enrutamiento de modelos

La elección de modelo debe estar desacoplada de la lógica del agente. El manifiesto declara una clase de capacidad, no una dependencia rígida de un modelo concreto.

Política:

- tareas deterministas: sin LLM;
- clasificación, extracción y salidas con esquema simple: modelo de menor coste que pase pruebas de calidad;
- síntesis y coordinación normal: modelo estándar;
- evaluación compleja, ambigua o crítica: modelo de mayor capacidad autorizado;
- fallback: solo si el primer modelo falla, excede timeout o no valida, y siempre dentro del presupuesto.

Antes de bajar de modelo en producción, evaluar un conjunto de pruebas representativas. La reducción de coste se acepta solo si cumple métricas de calidad, latencia y tasa de validación establecidas por el proyecto.

## 12. Observabilidad de eficiencia

Cada llamada o tarea debe registrar:

- `trace_id`, `task_id`, `agent_id` y workflow;
- perfil de presupuesto;
- tokens de entrada, salida y total cuando el proveedor los exponga;
- coste estimado y latencia;
- tamaño de contexto y número de documentos recuperados;
- modelo/proveedor y versión de manifiesto;
- caché utilizada;
- número de llamadas, reintentos y escalados;
- validación de output y resultado del workflow;
- razón de ampliar o reducir contexto.

Métricas mínimas de panel:

- tokens y coste por workflow, agente y tipo de tarea;
- ratio de `cache_hit`;
- ratio de validación al primer intento;
- reintentos por causa;
- documentos recuperados por tarea;
- tareas resueltas sin LLM;
- latencia por perfil;
- tasa de escalado a `extended`, `critical` y revisión humana.

No optimizar únicamente por tokens. Evaluar conjuntamente calidad, tasa de errores, costes completos, reintentos, latencia y resultados de negocio autorizados.

## 13. Plan de implementación

### Paso 1 — Medir la línea base

Antes de optimizar, instrumentar el sistema. Identificar las tareas que más tokens, coste, latencia y reintentos producen. No aplicar optimizaciones sin métrica de comparación.

### Paso 2 — Formalizar contratos y manifiestos

Definir esquemas de entrada/salida, perfiles de presupuesto, permisos, límites de contexto y políticas de escalado para cada agente.

### Paso 3 — Eliminar llamadas evitables

Implementar validación previa, respuestas deterministas, acceso a artefactos por ID, deduplicación y caché segura.

### Paso 4 — Aplicar recuperación selectiva

Incorporar metadatos, filtros, límites, resúmenes y niveles de confianza en Obsidian/RAG. Verificar que ninguna memoria no confiable entra como instrucción.

### Paso 5 — Optimizar prompts y salidas

Estabilizar instrucciones comunes, reducir duplicación, pedir JSON conciso y aplicar límites por tipo de tarea. Comprobar que la tasa de validación no empeora.

### Paso 6 — Añadir enrutamiento y escalado adaptativo

Evaluar modelos y perfiles con pruebas. Mantener fallback controlado y no degradar tareas críticas.

### Paso 7 — Validar continuamente

Comparar línea base y resultado por calidad, seguridad, latencia, coste y reintentos. Revertir toda optimización que deteriore los criterios de aceptación.

## 14. Criterios de aceptación

Una implementación cumple esta política si:

- evita reenviar el historial y la vault completa por defecto;
- utiliza contratos versionados y outputs validados;
- resuelve tareas deterministas sin LLM;
- aplica caché solo con claves, caducidad e invalidación seguras;
- limita herramientas y recuperación de datos grandes;
- tiene presupuestos adaptativos con escalado controlado;
- mantiene el veto de riesgo, la seguridad y la trazabilidad íntegros;
- mide tokens, coste, calidad, reintentos y latencia;
- demuestra mediante pruebas que la reducción de tokens no reduce la calidad acordada;
- no contiene ciclos ilimitados de comunicación entre agentes.

## 15. Decisión documental

Este documento es una política transversal y no reemplaza la especificación arquitectónica maestra ni las especificaciones de Trading. Debe guardarse como:

```text
docs/architecture/AGENT_TOKEN_EFFICIENCY_POLICY.md
```

Debe enlazarse desde `AGENCIA_MASTER_ARCHITECTURE_SPEC.md` y aplicarse a toda nueva oficina, manifiesto de agente, workflow y herramienta que se incorpore al proyecto.
