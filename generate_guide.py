from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib import colors

def create_pdf():
    doc = SimpleDocTemplate("Guia_Agentes_Especializados.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Title'],
        fontSize=24,
        textColor=colors.toColor('#1A237E'),
        alignment=TA_CENTER,
        spaceAfter=30
    )
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.toColor('#283593'),
        spaceBefore=20,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=12,
        leading=15,
        alignment=TA_LEFT,
        spaceAfter=10
    )

    content = []

    # Title
    content.append(Paragraph("Guía Paso a Paso: Creación de Agentes Especializados y Colaborativos", title_style))
    content.append(Spacer(1, 12))
    
    # Introduction
    content.append(Paragraph("Introducción", header_style))
    content.append(Paragraph(
        "La potencia de la IA moderna no reside solo en la capacidad de un modelo generalista, sino en la orquestación de múltiples agentes especializados. "
        "Al dividir un problema complejo en subtareas asignadas a expertos, reducimos alucinaciones y aumentamos la precisión técnica.", 
        body_style))

    # Step 1
    content.append(Paragraph("Paso 1: Definición de Dominios y Sectores", header_style))
    content.append(Paragraph(
        "Antes de crear los agentes, debes mapear el ecosistema de conocimiento necesario. No crees un 'agente que sepa todo', crea agentes que dominen un área.", 
        body_style))
    content.append(ListFlowable([
        ListItem(Paragraph("Identifica los pilares: (Ej. Legal, Técnico, Marketing, Financiero).", body_style)),
        ListItem(Paragraph("Define el objetivo final del sistema: ¿Qué resultado exacto quieres obtener?", body_style)),
    ], bulletType='bullet'))

    # Step 2
    content.append(Paragraph("Paso 2: Perfilado del Agente (Prompting Especializado)", header_style))
    content.append(Paragraph(
        "Cada agente debe tener una 'identidad' clara. Un agente especializado se define por su Rol, sus Restricciones y sus Herramientas.", 
        body_style))
    content.append(ListFlowable([
        ListItem(Paragraph("Asigna un Rol: 'Eres un experto en ciberseguridad con 20 años de experiencia en OWASP'.", body_style)),
        ListItem(Paragraph("Establece Restricciones: 'No sugieras soluciones que requieran licencias pagas'.", body_style)),
        ListItem(Paragraph("Define Herramientas: Acceso a APIs específicas, búsqueda web o análisis de código.", body_style)),
    ], bulletType='bullet'))

    # Step 3
    content.append(Paragraph("Paso 3: Diseño del Protocolo de Comunicación", header_style))
    content.append(Paragraph(
        "Para que trabajen entre ellos, necesitan un flujo de datos claro. Existen tres modelos principales:", 
        body_style))
    content.append(ListFlowable([
        ListItem(Paragraph("Lineal (Pipeline): El Agente A termina -> Pasa resultado al Agente B.", body_style)),
        ListItem(Paragraph("Radial (Hub & Spoke): Un Orquestador central distribuye tareas y sintetiza respuestas.", body_style)),
        ListItem(Paragraph("Colaborativo (Panel): Los agentes debaten el resultado hasta llegar a un consenso.", body_style)),
    ], bulletType='bullet'))

    # Step 4
    content.append(Paragraph("Paso 4: Implementación del Orquestador", header_style))
    content.append(Paragraph(
        "El orquestador es la 'mente' que sabe a quién llamar y cuándo. Sus funciones son:", 
        body_style))
    content.append(ListFlowable([
        ListItem(Paragraph("Descomposición: Romper la solicitud del usuario en subtareas.", body_style)),
        ListItem(Paragraph("Enrutamiento: Asignar cada subtarea al agente experto correcto.", body_style)),
        ListItem(Paragraph("Síntesis: Unir todas las respuestas en un entregable final coherente.", body_style)),
    ], bulletType='bullet'))

    # Step 5
    content.append(Paragraph("Paso 5: Bucle de Retroalimentación y Refinamiento", header_style))
    content.append(Paragraph(
        "Un sistema multi-agente rara vez es perfecto a la primera. Implementa un paso de 'Crítica'.", 
        body_style))
    content.append(ListFlowable([
        ListItem(Paragraph("Crea un Agente Revisor: Su único trabajo es buscar errores en el trabajo de los otros.", body_style)),
        ListItem(Paragraph("Iteración: Si el revisor encuentra fallos, el trabajo vuelve al agente especialista.", body_style)),
    ], bulletType='bullet'))

    # Conclusion
    content.append(Spacer(1, 20))
    content.append(Paragraph("Conclusión", header_style))
    content.append(Paragraph(
        "Al implementar este sistema, pasas de tener un asistente de chat a tener una empresa virtual de expertos trabajando en paralelo para ti. "
        "La clave es la modularidad: es más fácil mejorar un agente especializado que intentar arreglar un modelo generalista.", 
        body_style))

    doc.build(content)

if __name__ == "__main__":
    create_pdf()
