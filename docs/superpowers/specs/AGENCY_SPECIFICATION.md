# **AGENCY\_SPECIFICATION.md: Sistema de Agencia Multi-Agente Autónoma**

## **1\. Estrategia de Desarrollo y Fases del Proyecto**

### **Fase 1: Construcción y Maquetación**

* **Objetivo:** Construcción de la arquitectura base, motor de agentes, base de datos y la interfaz gráfica Pixel Art.  
* **Stack de Desarrollo:** Claude Code (ejecución principal de código y orquestación), GPT-4o / Windsurf / Cursor (maquetación Pixel Art CSS/Canvas y componentes frontend).

### **Fase 2: Producción y Ejecución en Vivo**

* **Objetivo:** Operación autónoma 24/7 con asignación eficiente de modelos según el rol.

| Rol en la Agencia | Modelo de IA | Motor de Ejecución | Función |
| :---- | :---- | :---- | :---- |
| **Director General & Riesgos** | Claude Sonnet / DeepSeek R1 | API Oficial / DeepSeek | Estrategia, veto pre-ejecución y evaluación. |
| **Secretaría & Triaje 24/7** | Hermes Agent / Llama 3.3 | OpenRouter (Costo 0€) | Recepción 24/7, clasificación y agenda. |
| **Trabajadores Especialistas** | DeepSeek V3 / GPT-4o / Claude Code | AionUi \+ APIs | Trading, copywriting, guiones y scrapers. |
| **Consolidador de Memoria** | Agente liviano (Cron Job) | Backend Local | Procesamiento nocturno de memoria en Obsidian. |

## **2\. Arquitectura de Memoria Viva y Bucle de Retroalimentación (Obsidian)**

El sistema debe auto-optimizarse en cada ciclo de trabajo registrando tres variables fundamentales: **Búsquedas realizadas**, **Errores cometidos** y **Profits/Resultados obtenidos**.

### **A. Estructura de Vault en Obsidian**

Plaintext  
obsidian\_vault/  
├── 01\_episodic\_logs/       \# Logs en bruto de cada tarea completada  
├── 02\_skills/              \# Estrategias exitosas convertidas en funciones/prompts  
└── 03\_rules/  
    └── VAULT\_RULES.md      \# Reglas globales y vetos para evitar errores pasados

### **B. Protocolo de Aprendizaje Continuo (Feedback Loop)**

1. **Registro Episódico (/01\_episodic\_logs):** Al finalizar una tarea, el agente guarda un JSON/Markdown con:  
   * search\_data: Fuentes consultadas y términos de búsqueda efectivos.  
   * errors\_encountered: Fallos de sintaxis, excepciones de API o vetos del Director.  
   * outcome\_profit: Métricas de éxito (ROI, CTR, código sin errores, tiempo gastado).  
2. **Abstracción de Skills (/02\_skills):** Si una ejecución genera un alto *profit* o tasa de éxito, el agente consolidador abstrae la técnica y genera un archivo .md reutilizable para el resto de agentes.  
3. **Actualización de Reglas Globale (VAULT\_RULES.md):** Si una ejecución genera errores o pérdidas, la causa raíz se escribe en VAULT\_RULES.md.

## **3\. Especificaciones para el Frontend (Pixel Art UI)**

* **Estética:** Interfaz retro Pixel Art (HTML5 Canvas / Tailwind) representando el edificio corporativo por plantas interactivas (Recepción, Trading, Contenido, Incubadora).  
* **Visualización de Agentes:** Cada agente se muestra como un sprite animado con estados visuales (*Idle*, *Thinking*, *Working*, *Error*, *Success*).  
* **Telemetría:** Panel lateral para inspección de archivos .md de Obsidian, logs en tiempo real y árbol de decisiones.

## **4\. Directivas de Implementación para Claude Code**

Al construir este proyecto, Claude Code debe:

* Implementar un middleware en FastAPI para cargar obligatoriamente VAULT\_RULES.md en el contexto del sistema antes de procesar cualquier prompt de agente.  
* Crear el script de consolidación de memoria nocturna que lea la carpeta 01\_episodic\_logs, actualice VAULT\_RULES.md y limpie redundancias.  
* Separar estrictamente los conectores API de producción para alternar entre OpenRouter (Hermes) y Claude/DeepSeek según la fase del flujo.

