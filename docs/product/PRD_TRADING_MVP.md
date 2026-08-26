# PRD — Trading MVP (Equipo Analista)

> **Estado:** Aprobado
> **Fecha:** 2026-08-26
> **Autor:** Arquitecto Principal (con decisiones del propietario del proyecto)
> **Fuente de verdad:** Este documento es obligatorio para Claude Code antes de iniciar la construcción.

---

## 1. Visión de producto

Construir un equipo de agentes de trading tipo "Wall Street" que trabajen de forma conjunta para asistir al propietario en sus decisiones de trading. El equipo proporciona:

- **Noticias** relevantes de los mercados trabajados.
- **Estrategias** backtesteadas y validadas de forma determinista.
- **Lectura de mercado** para simplificar el análisis.

**Visión de futuro (NO en el MVP):** un *sintetizador de EAs* que genere bots de trading autónomos capaces de operar por sí solos con las estrategias rentables encontradas. Esta capacidad se documenta en el roadmap y se construye en una fase posterior, solo tras validar el motor determinista y el equipo analista.

---

## 2. Alcance del MVP

### 2.1 Incluido en el MVP

- Equipo de agentes analistas (noticias, estrategias, lectura de mercado).
- Motor de backtesting determinista y reproducible.
- Paper trading con capital virtual.
- Guardián de riesgo determinista (reglas no negociables).
- Memoria viva en Obsidian (conocimiento cualitativo).
- Frontend Pixel Art (Canvas/Tailwind + WebSockets).
- Panel de administración.

### 2.2 Excluido del MVP

- Ejecución real con dinero (la realizarán los EAs en fases posteriores).
- Sintetizador de EAs.
- Múltiples estrategias simultáneas en producción.
- Optimización automática de parámetros.
- Notificaciones por email/telegram.
- Panel de administración de usuarios externos.
- Otros departamentos (marketing, contenido, etc.).

---

## 3. Usuario

- **Único usuario en el MVP:** el propietario (administrador).
- Usuarios externos: posible en el futuro, fuera del alcance actual.

---

## 4. Mercado e instrumentos

- **Instrumento inicial:** XAUUSD (oro vs dólar).
- **Visión de futuro:** capacidad de los agentes para analizar cualquier tipo de mercado. Fuera del MVP.

---

## 5. Datos de mercado

- **Fuente:** API gratuita (a confirmar en fase de implementación: Binance, Alpha Vantage, Twelve Data u otra que soporte XAUUSD).
- **Frecuencia:** histórica + tiempo real.
- **Almacenamiento de datos estructurados:** PostgreSQL (o archivos Parquet/CSV versionados). **Nunca en Obsidian.**
- **Obsidian** guarda únicamente el conocimiento cualitativo: patrones, gestión de riesgo, lecciones, reglas.

---

## 6. Capital y divisa

| Concepto | Valor |
|---|---|
| Capital paper trading | 1.000 € (virtual) |
| Capital inversión real | ~100 € por operación (fase EAs, fuera del MVP) |
| Divisa base | EUR |

---

## 7. Criterios de aceptación del MVP

El MVP se considera válido cuando se cumple **todo** lo siguiente:

- [ ] Backtest reproducible: mismo dataset, parámetros y versión de estrategia producen resultados idénticos.
- [ ] Paper trading funcionando sin errores durante un periodo de validación acordado.
- [ ] El guardián de riesgo bloquea correctamente toda operación que viole las reglas.
- [ ] El kill switch detiene toda orden nueva al alcanzar la pérdida diaria.
- [ ] El frontend no muestra una operación como completada sin confirmación del backend.
- [ ] Ninguna decisión de dinero depende de una respuesta LLM.
- [ ] Ningún secreto aparece en logs, respuestas de API, Obsidian o repositorio.
- [ ] El equipo de agentes entrega noticias, estrategias y lectura de mercado de forma operativa.

---

## 8. Roadmap (visión de futuro)

| Fase | Contenido |
|---|---|
| Fase 1-3 | Equipo analista + backtesting + paper trading (MVP) |
| Fase 4+ | Sintetizador de EAs (bots autónomos) |
| Fase 4+ | Ejecución real con aprobación humana explícita |
| Futuro | Análisis multi-mercado, recomendaciones de inversión |
