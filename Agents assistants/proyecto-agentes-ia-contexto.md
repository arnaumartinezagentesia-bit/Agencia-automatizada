# Aplicación de agentes IA especializados — Documento de contexto y hoja de ruta

> Este documento resume el proyecto para servir de contexto a una IA (Abacus LLM) durante la fase de diseño y especificación, antes de pasar a la fase de implementación con Claude Code.

---

## 1. Objetivo del proyecto

Crear una aplicación en la que varios agentes de IA, cada uno especializado en una tarea muy concreta, ayuden al usuario en distintas áreas de negocio: trading, dropshipping, y gestión de contenido en YouTube (con posibilidad de añadir más áreas en el futuro).

Los agentes **no sustituyen** al usuario ni le hacen el trabajo completo. Su función es asistirle en los aspectos donde tiene menos conocimiento o donde una IA puede aportar valor por su constancia (monitorización continua, análisis repetitivo, procesamiento de grandes volúmenes de información) mejor que una persona trabajando sola.

---

## 2. Descripción general del producto

La aplicación tiene una **pantalla principal** que representa visualmente a los agentes como personas trabajando en oficinas. Cada oficina corresponde a un departamento (trading, dropshipping, YouTube automatizado, etc.), y dentro de cada oficina trabajan varios agentes especializados en tareas concretas de ese departamento.

- En la pantalla principal solo se puede **ver** la representación de los departamentos y sus agentes — no hay interacción más allá de la visualización.
- Al hacer clic en una oficina (o en un panel lateral equivalente), se abre:
  - Una vista más cercana de esa oficina, con los agentes que trabajan en ella.
  - Un panel de chat para hablar con los agentes de ese departamento — ya sea de forma general (dirigido a todo el departamento) o con un agente específico.

---

## 3. Departamentos y agentes conocidos hasta ahora

### 🟦 Trading
- Agente de backtest
- Agente de generación/optimización de estrategias
- Agente de gestión de riesgo
- Agente de interpretación de noticias y su impacto en el mercado
- Agente de detección de patrones de mercado

### 🟧 Dropshipping
- Agente de marketing
- Agente de búsqueda de productos
- Agente de validación de productos

### 🟪 YouTube automatizado
- Agentes por definir — pendiente de especificar la función concreta de cada uno.

*(La arquitectura debe permitir añadir nuevos departamentos y agentes en el futuro sin necesidad de rediseñar el sistema completo.)*

---

## 4. Arquitectura general (backend)

- **Orquestador general:** recibe las peticiones del usuario (generales o dirigidas a un agente/departamento concreto) y las enruta al agente adecuado.
- **Departamentos:** agrupan a varios agentes especializados, cada uno con una función muy delimitada.

### Preguntas abiertas a resolver durante la fase de diseño

Estas son las decisiones que quedan por especificar (con ayuda de Abacus, a nivel conceptual, sin entrar todavía en código):

1. ¿Cómo decide el orquestador a qué agente enviar cada petición del usuario?
2. ¿Los agentes de un mismo departamento comparten memoria/contexto entre sí, o trabajan de forma aislada?
3. ¿Qué agentes funcionan bajo demanda (el usuario pregunta y el agente responde) y cuáles deberían funcionar de forma autónoma/programada (monitorizando algo de forma constante, por ejemplo noticias o precios)?
4. ¿Qué herramientas o APIs externas necesita cada agente? Por ejemplo:
   - Trading: datos de mercado en tiempo real o histórico, fuentes de noticias financieras.
   - Dropshipping: herramientas de búsqueda/scraping de productos, datos de proveedores.
   - YouTube: YouTube Data API u otras herramientas de automatización de contenido.

---

## 5. Interfaz de usuario (frontend)

- **Pantalla principal:** vista general de las oficinas/departamentos, solo visualización.
- **Vista de oficina (al hacer clic):** vista de cerca de los agentes de ese departamento + panel de chat (general o con un agente específico).
- Esta capa se especificará con más detalle más adelante. En esta fase basta con dejar clara la idea general para que, cuando se implemente, se entienda la visión final del producto.

---

## 6. Plan de desarrollo por fases (recomendado)

### Fase 1 — MVP de un solo departamento, sin interfaz visual
- Elegir un departamento para validar el patrón completo (recomendado: **trading**, por ser el más definido hasta ahora).
- Construir el orquestador junto con los agentes de ese departamento.
- Interfaz mínima: un chat de texto simple, sin gráficos ni oficinas.
- Objetivo: comprobar que el orquestador reparte bien las peticiones y que cada agente responde con la calidad esperada.

### Fase 2 — Replicar el patrón a los demás departamentos
- Añadir dropshipping y YouTube automatizado reutilizando la arquitectura ya validada en la Fase 1.
- Terminar de definir los agentes de YouTube automatizado (pendiente).

### Fase 3 — Interfaz visual de oficinas
- Con el backend ya probado y funcionando, construir la capa visual: oficinas, personitas trabajando, paneles al hacer clic.
- En esta fase se especifican los detalles finales de diseño e interacción de la interfaz.

---

## 7. Calendario del proyecto

- **Ahora → octubre 2026:** fase de diseño y especificación con Abacus LLM (arquitectura general, specs de cada agente, specs del orquestador).
- **Octubre 2026 en adelante:** implementación con Claude Code, empezando por la Fase 1 (MVP del departamento de trading).

---

## 8. Qué queda por definir en estos meses con Abacus

### Plantilla por cada agente (rellenar una por agente)
- Nombre del agente
- Departamento al que pertenece
- Función específica (una frase clara y concreta)
- Entradas que recibe
- Salidas que produce
- Herramientas/APIs que necesita
- Modo de activación: bajo demanda / autónomo-programado

### Especificación del orquestador
- Lógica de enrutamiento de peticiones a cada agente
- Modelo de comunicación entre agentes (si comparten contexto o no)
- Manejo de conversación general del usuario vs. conversación dirigida a un agente concreto

### Especificación superficial de la interfaz
- Lista de pantallas de la aplicación
- Qué se ve y qué se puede hacer en cada pantalla

---

## 9. Cómo usar este documento con Abacus

Sugerencia de uso: pegar este documento completo como contexto inicial en la conversación con Abacus, y pedirle que ayude a rellenar la plantilla de la sección 8 agente por agente, empezando por el departamento de trading (backtest, estrategias, gestión de riesgo, noticias/patrones), después dropshipping, y por último definiendo desde cero los agentes de YouTube automatizado.

El resultado de ese trabajo (specs completas de cada agente + spec del orquestador) será el material de partida para Claude Code en octubre.
