Guarda el siguiente archivo como OBSIDIAN\_MEMORY\_SPEC.md en la raíz de tu proyecto para que Claude Code tenga la especificación exacta al construir el módulo de memoria en FastAPI y la bóveda en Obsidian.

# **OBSIDIAN\_MEMORY\_SPEC.md: Sistema de Memoria Departamental y Retroalimentación**

Este documento define la arquitectura de memoria persistente, el formato de captura de datos en bruto y la lógica de curación automática mediante una bóveda única de Obsidian.

## **1\. Estructura Físicas de la Bóveda (**./obsidian\_vault**)**

La memoria se organiza en una **bóveda única** segmentada en subdirectorios aislados por departamentos, junto a una capa de conocimiento compartido y una zona de logs episódicos:

Plaintext  
obsidian\_vault/  
├── 00\_core\_shared/           \# Conocimiento transversal (Matemáticas, Economía, Marketing, Prompts Base)  
│   └── VAULT\_RULES.md        \# Reglas globales inmutables y vetos aprendidos  
├── 01\_office\_trading/        \# Estrategias quant, lecciones de mercado, APIs financieras  
├── 02\_office\_dropshipping/   \# Análisis de nichos, métricas de proveedores, copys de conversión  
├── 03\_office\_content/        \# Tendencias, estructuras de guiones, rendimiento de publicaciones  
├── 04\_office\_incubator/      \# PRDs, estudios de viabilidad y estructuras de nuevas plantas  
└── 99\_raw\_logs/              \# Captura en bruto en formato JSON (Entrada del bucle)

## **2\. Protocolo de Captura en Bruto (JSON Raw Logs)**

Al finalizar cada ejecución, el agente participante debe generar un archivo .json en la carpeta 99\_raw\_logs/ con la nomenclatura YYYYMMDD\_HHMMSS\_\[agente\]\_\[task\_id\].json.

### **Esquema del JSON:**

JSON  
{  
  "timestamp": "2026-08-26T01:00:00Z",  
  "agent\_id": "quant\_analyst\_01",  
  "office": "01\_office\_trading",  
  "task\_type": "backtest\_strategy",  
  "input\_context": {  
    "searches\_made": \["estrategia momentum crypto 2026", "apiv3 binance rate limit"\],  
    "sources\_consulted": \["01\_office\_trading/strategies\_v1.md"\]  
  },  
  "execution\_metrics": {  
    "errors\_encountered": \[\],  
    "uncaught\_exceptions": 0,  
    "profit\_metric": 12.45,  
    "execution\_time\_seconds": 4.2  
  },  
  "output\_summary": "Estrategia validada con Sharpe Ratio \> 2.1.",  
  "proposed\_learnings": "El límite de peticiones en la API de Binance requiere un delay de 150ms entre llamadas."  
}

## **3\. Agente Curador (The Librarian Agent)**

Un agente dedicado con modelo liviano ejecutado vía **Cron Job nocturno** (03:00 AM local) para minimizar el consumo de tokens y procesar los registros de 99\_raw\_logs/.

### **Tareas Operativas del Curador:**

* **Escanear y Consolidar:** Lee todos los archivos JSON acumulados en 99\_raw\_logs/.  
*   
* **Deduplicación Semántica:** Identifica aprendizajes redundantes y los sintetiza en una única nota dentro del departamento correspondiente.  
*   
* **Auto-Enlazado (**\[\[links\]\]**):** Conecta automáticamente las notas creadas con la carpeta 00\_core\_shared/ o con conceptos previos del departamento usando la sintaxis de enlace de Obsidian.  
*   
* **Limpieza y Archivado:** Tras procesar y validar las notas, traslada los archivos JSON de 99\_raw\_logs/ a un subdirectorio comprimido /archive/ o los elimina si carecen de valor semántico.  
* 

## **4\. Criterios Estrictos de Graduación y Vetos**

El Agente Curador aplicará filtros estrictos para transformar un log en bruto en una **Skill oficial** o una **Regla de Veto**:

| Tipo de Conocimiento | Criterio de Graduación Requerido | Ubicación de Destino |
| :---- | :---- | :---- |
| **Skill de Departamento** | profit\_metric \> 0 \+ uncaught\_exceptions \== 0 \+ Validación cuantitativa estricta. | Carpetas 01\_ a 04\_ según la oficina. |
| **Regla de Veto / Error** | Presencia de fallos graves, pérdidas monetarias o bloqueos de API (uncaught\_exceptions \> 0). | 00\_core\_shared/VAULT\_RULES.md |

## **5\. Directivas de Integración para Claude Code (FastAPI Backend)**

* **Restricción de Contexto:** Al invocar a un agente especialista (ej. Trading), el servidor FastAPI solo leerá e inyectará los archivos pertenecientes a 00\_core\_shared/ y 01\_office\_trading/.  
*   
* **Carga Obligatoria de Vetos:** Es obligatorio incluir siempre el contenido actualizado de VAULT\_RULES.md en el System Prompt de cualquier agente previo a su ejecución.  
*   
* **Telemetría y Visualización:** Exponer un endpoint WebSocket /api/memory/graph que lea el índice de notas y sus enlaces bidireccionales en la bóveda para proyectar el árbol de conocimiento en la interfaz Pixel Art.

