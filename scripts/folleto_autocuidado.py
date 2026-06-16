# -*- coding: utf-8 -*-
"""Genera el folleto PDF de autocuidado para cuidadores (REDBOPEA).
Contenido original. Diseño limpio en A4, listo para imprimir o enviar."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    ListFlowable, ListItem, KeepTogether, FrameBreak, NextPageTemplate, PageBreak,
)

MARCA = colors.HexColor("#1E3A5F")
MARCA_CLARO = colors.HexColor("#2C5282")
FONDO_SUAVE = colors.HexColor("#EAF0F6")
VERDE = colors.HexColor("#2F855A")
VERDE_SUAVE = colors.HexColor("#E6F4EA")
AMBAR_SUAVE = colors.HexColor("#FFF4E0")
AMBAR_BORDE = colors.HexColor("#E0A53F")
GRIS = colors.HexColor("#4A5568")

OUT = "docs/folleto_autocuidado_cuidadores.pdf"

styles = getSampleStyleSheet()


def S(name, **kw):
    base = kw.pop("parent", styles["Normal"])
    return ParagraphStyle(name, parent=base, **kw)


st_titulo = S("titulo", fontName="Helvetica-Bold", fontSize=26, textColor=colors.white,
              leading=30, alignment=TA_CENTER)
st_subtitulo = S("subtitulo", fontName="Helvetica", fontSize=13, textColor=colors.white,
                 leading=18, alignment=TA_CENTER)
st_marca = S("marca", fontName="Helvetica-Bold", fontSize=11, textColor=colors.white,
             alignment=TA_CENTER, leading=14)
st_h = S("h", fontName="Helvetica-Bold", fontSize=14, textColor=MARCA, leading=18,
         spaceBefore=10, spaceAfter=4)
st_body = S("body", fontSize=10.5, leading=15, textColor=colors.HexColor("#222222"),
            spaceAfter=4)
st_lead = S("lead", fontSize=10.5, leading=15, textColor=colors.white)
st_callout = S("callout", fontSize=10.5, leading=15, textColor=MARCA)
st_callout_b = S("callout_b", fontSize=11, leading=15, textColor=MARCA, fontName="Helvetica-Bold")
st_li = S("li", fontSize=10, leading=14, textColor=colors.HexColor("#222222"))
st_small = S("small", fontSize=8.5, leading=11, textColor=GRIS)
st_th = S("th", fontName="Helvetica-Bold", fontSize=10, textColor=colors.white, leading=13)
st_td = S("td", fontSize=9.5, leading=13, textColor=colors.HexColor("#222222"))
st_safety = S("safety", fontSize=10.5, leading=15, textColor=colors.HexColor("#7B341E"))


def caja(parrafos, fondo, borde=None, pad=10):
    """Recuadro con fondo y borde opcional."""
    inner = []
    for p in parrafos:
        inner.append(p)
    t = Table([[inner]], colWidths=[160 * mm])
    estilo = [
        ("BACKGROUND", (0, 0), (-1, -1), fondo),
        ("LEFTPADDING", (0, 0), (-1, -1), pad),
        ("RIGHTPADDING", (0, 0), (-1, -1), pad),
        ("TOPPADDING", (0, 0), (-1, -1), pad),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]
    if borde:
        estilo.append(("LINEBEFORE", (0, 0), (0, -1), 3, borde))
        estilo.append(("BOX", (0, 0), (-1, -1), 0.5, borde))
    t.setStyle(TableStyle(estilo))
    return t


def vinetas(items, color_bullet=MARCA):
    lf = ListFlowable(
        [ListItem(Paragraph(t, st_li), leftIndent=6, value="•") for t in items],
        bulletType="bullet", bulletColor=color_bullet, bulletFontSize=10, leftIndent=12,
    )
    return lf


def _box_cell():
    """Casilla cuadrada vacía para tildar a mano."""
    b = Table([[""]], colWidths=[3.4 * mm], rowHeights=[3.4 * mm])
    b.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.8, MARCA)]))
    return b


def checklist(items):
    rows = [[_box_cell(), Paragraph(t, st_li)] for t in items]
    t = Table(rows, colWidths=[8 * mm, 152 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
    ]))
    return t


# ---------------- Documento ----------------
PAGE_W, PAGE_H = A4

doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=25 * mm, rightMargin=25 * mm,
                      topMargin=22 * mm, bottomMargin=18 * mm, title="Guía de autocuidado para cuidadores",
                      author="REDBOPEA")

frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")


def pie(canvas, doc_):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRIS)
    if doc_.page > 1:
        canvas.drawCentredString(PAGE_W / 2, 10 * mm, f"REDBOPEA · Guía de autocuidado · {doc_.page}")
    canvas.restoreState()


def portada(canvas, doc_):
    canvas.saveState()
    canvas.setFillColor(MARCA)
    canvas.rect(0, PAGE_H - 120 * mm, PAGE_W, 120 * mm, fill=1, stroke=0)
    canvas.setFillColor(MARCA_CLARO)
    canvas.rect(0, PAGE_H - 124 * mm, PAGE_W, 4 * mm, fill=1, stroke=0)
    canvas.restoreState()
    pie(canvas, doc_)


doc.addPageTemplates([
    PageTemplate(id="portada", frames=[Frame(25 * mm, 18 * mm, PAGE_W - 50 * mm, PAGE_H - 40 * mm, id="p")], onPage=portada),
    PageTemplate(id="main", frames=[frame], onPage=pie),
])

story = []

# ---- Portada ----
story.append(Spacer(1, 18 * mm))
story.append(Paragraph("Guía práctica de<br/>autocuidado y afrontamiento", st_titulo))
story.append(Spacer(1, 6 * mm))
story.append(Paragraph("Para cuidadoras y cuidadores de adolescentes<br/>con Trastorno del Espectro Autista (TEA)", st_subtitulo))
story.append(Spacer(1, 8 * mm))
story.append(Paragraph("RED BOLIVIANA DE PADRES DE PERSONAS CON AUTISMO · REDBOPEA", st_marca))
story.append(Spacer(1, 38 * mm))
story.append(caja([Paragraph("<b>Cuidarte no es egoísmo. Es parte del cuidado.</b><br/>"
                             "Nadie puede dar agua de un vaso vacío. Recargarte también es cuidar a tu hijo o hija.",
                             st_callout)], FONDO_SUAVE, borde=MARCA))
story.append(Spacer(1, 6 * mm))
story.append(Paragraph("Material de apoyo emocional y psicoeducativo. No reemplaza la atención de un profesional "
                       "de salud mental. Si vos o alguien de tu familia está en riesgo, buscá ayuda profesional de "
                       "inmediato (ver sección 8).", st_small))
story.append(NextPageTemplate("main"))
story.append(PageBreak())


def seccion(num, titulo):
    story.append(Paragraph(f"{num}. {titulo}", st_h))


# 1
seccion(1, "Para vos, que cuidás")
story.append(Paragraph("Cuidar a un hijo o hija adolescente con TEA es un acto de amor enorme, y también un trabajo "
                       "que no termina. Es normal sentirse cansada, irritable, sola o culpable. <b>Sentir eso no te "
                       "hace una mala madre o un mal padre: te hace humano.</b>", st_body))

# 2
seccion(2, "Reconocer el estrés del cuidador")
story.append(Paragraph("El estrés sostenido se acumula sin que lo notemos. Marcá las señales que reconocés en vos:", st_body))
story.append(Paragraph("<b>En el cuerpo</b>", st_body))
story.append(checklist(["Cansancio que no se va con dormir", "Dolores de cabeza, espalda o estómago",
                         "Dormir mal o demasiado", "Enfermarte seguido"]))
story.append(Paragraph("<b>En las emociones</b>", st_body))
story.append(checklist(["Irritabilidad, “saltar” por cosas pequeñas", "Tristeza, ganas de llorar",
                         "Ansiedad o preocupación constante", "Sentirte vacía/o o “en automático”"]))
story.append(Paragraph("<b>En la conducta y los pensamientos</b>", st_body))
story.append(checklist(["Aislarte de amistades y familia", "Descuidar tus propias necesidades",
                         "Pensar “no puedo más” o “nadie entiende”", "Perder el disfrute de cosas que antes te gustaban"]))
story.append(Spacer(1, 3))
story.append(caja([Paragraph("Si marcaste varias, no es debilidad: es una señal de que <b>tu tanque está bajo</b> "
                             "y necesitás recargar. Las secciones siguientes son herramientas para hacerlo.", st_callout)],
                  FONDO_SUAVE, borde=MARCA))

# 3
story.append(PageBreak())
seccion(3, "Estrategias que ayudan (afrontamiento que suma)")
story.append(Paragraph("No hace falta hacerlas todas. Elegí <b>una o dos</b> para empezar esta semana.", st_body))
ayudas = [
    ("Resolver lo que sí se puede", "Preguntate: ¿qué parte de esto sí está en mis manos? Dividilo en pasos pequeños y empezá por uno."),
    ("Planificar y anticipar", "Las rutinas y la anticipación bajan tu estrés y el de tu hijo/a: dejá todo listo la noche anterior, usá calendarios visuales."),
    ("Pedir y aceptar apoyo", "Apoyo emocional (alguien que escuche sin juzgar) y práctico (delegar tareas concretas). Pedir ayuda no es fracasar."),
    ("Mirar distinto", "No “ser positivo a la fuerza”, sino buscar lo que también es verdad: qué aprendí, qué fortaleza mía aparece, qué avance hubo hoy."),
    ("Aceptar lo que no se puede cambiar", "Aceptar no es resignarse: es dejar de pelear con lo imposible para usar la energía en lo que sí podés influir."),
    ("Cuidar el cuerpo", "Sueño protegido, movimiento (una caminata de 10–15 min), comer e hidratarte a tus horas, respirar."),
    ("Tiempo propio, aunque sea poco", "Cinco o diez minutos al día que sean tuyos. No es lujo: es mantenimiento."),
    ("Sentido, fe o comunidad", "Si la espiritualidad o la pertenencia te dan fuerza y calma, apoyate en eso."),
    ("Humor", "Reírse de un mal día —sin minimizar el dolor— descomprime, sobre todo con quienes “entienden”."),
]
for t, d in ayudas:
    story.append(Paragraph(f"<b>{t}.</b> {d}", st_li))
    story.append(Spacer(1, 3))

# 4
story.append(PageBreak())
seccion(4, "Estrategias que conviene reducir")
story.append(Paragraph("Todos las usamos a veces; el problema es cuando se vuelven el modo principal.", st_body))
data = [
    [Paragraph("En vez de…", st_th), Paragraph("Probá…", st_th)],
    [Paragraph("Negar o tapar (“no pasa nada”)", st_td), Paragraph("Nombrar lo que sentís: “estoy agotada y necesito una pausa”.", st_td)],
    [Paragraph("Aislarte y abandonar", st_td), Paragraph("Un paso pequeño + avisarle a una persona de confianza.", st_td)],
    [Paragraph("Alcohol u otras sustancias para calmar", st_td), Paragraph("Una técnica de la sección 5; si cuesta parar, buscar apoyo profesional.", st_td)],
    [Paragraph("Culparte (“es mi culpa”)", st_td), Paragraph("Hablarte como le hablarías a una amiga en tu lugar.", st_td)],
    [Paragraph("Rumiar (darle vueltas sin fin)", st_td), Paragraph("Escribir la preocupación y posponerla a un “horario de preocuparse”.", st_td)],
]
tbl = Table(data, colWidths=[75 * mm, 85 * mm])
tbl.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), MARCA),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, FONDO_SUAVE]),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C9D6E5")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(tbl)

# 5
seccion(5, "Caja de herramientas rápidas")
herr = [
    ("Respiración 4–6", "Inhalá contando 4, exhalá contando 6. Repetí 6 veces. La exhalación larga calma al cuerpo."),
    ("Anclaje 5-4-3-2-1", "Nombrá 5 cosas que ves, 4 que oís, 3 que podés tocar, 2 que olés, 1 que saboreás. Te trae al presente."),
    ("Pausa de 90 segundos", "Antes de reaccionar a una emoción intensa, date 90 segundos: respirá, tomá agua, salí del cuarto."),
    ("Regla de los 2 minutos", "Si una tarea lleva menos de 2 minutos, hacela ya; saca peso mental."),
    ("Lo bueno de hoy", "Antes de dormir, anotá una cosa que salió bien, por pequeña que sea."),
]
for t, d in herr:
    story.append(Paragraph(f"<b>{t}.</b> {d}", st_li))
    story.append(Spacer(1, 3))

# 6
story.append(PageBreak())
seccion(6, "Tu red de apoyo")
story.append(Paragraph("Anotá quién está en cada círculo. Si alguno está vacío, ese es un buen lugar para sumar apoyo.", st_body))
story.append(vinetas([
    "<b>Círculo íntimo:</b> pareja, familia cercana.",
    "<b>Círculo cercano:</b> amistades, otras familias de la REDBOPEA.",
    "<b>Círculo profesional:</b> pediatra/neurólogo, psicólogo/a, terapeutas, escuela.",
    "<b>Círculo comunitario:</b> grupos, iglesia, vecinos, instituciones.",
]))
story.append(Spacer(1, 4))
story.append(caja([Paragraph("La REDBOPEA es parte de tu red: otras familias ya recorrieron lo que estás viviendo. "
                             "No tenés que reinventar el camino sola/o.", st_callout)], FONDO_SUAVE, borde=MARCA))

# 7
seccion(7, "Cuidar la convivencia (adolescentes con TEA)")
story.append(vinetas([
    "<b>Anticipá los cambios:</b> las transiciones son más llevaderas cuando se avisan antes.",
    "<b>Rutinas claras y visuales:</b> dan previsibilidad y reducen conflictos.",
    "<b>Las crisis no son “malcriadez”:</b> suelen comunicar sobrecarga. Tu calma regula.",
    "<b>No te compares:</b> los avances de tu hijo/a son los que cuentan.",
    "<b>Cuidá las otras relaciones:</b> tu pareja, tus otros hijos, vos misma/o.",
    "<b>Pensando en el futuro:</b> la autonomía y la vida adulta, un paso a la vez y con el equipo profesional.",
]))

# 8
story.append(PageBreak())
seccion(8, "Cuándo buscar ayuda profesional")
story.append(Paragraph("Buscá apoyo de un profesional de salud mental <b>sin esperar a “tocar fondo”</b> si notás:", st_body))
story.append(vinetas([
    "Tristeza, angustia o insomnio que duran semanas y no ceden.",
    "Perder el interés o el disfrute en casi todo.",
    "Ansiedad que te impide funcionar.",
    "Uso de alcohol u otras sustancias para sobrellevar el día.",
    "<b>Pensamientos de hacerte daño o de que sería mejor no estar.</b>",
]))
story.append(Spacer(1, 4))
story.append(caja([
    Paragraph("IMPORTANTE — Si tenés pensamientos de hacerte daño, no estás sola/o y esto se puede ayudar.", st_callout_b),
    Spacer(1, 4),
    Paragraph("Contactá ahora mismo a un profesional, acudí a un servicio de urgencias o pedí a alguien de confianza "
              "que te acompañe.", st_safety),
    Spacer(1, 4),
    Paragraph("Teléfonos de emergencia y de salud mental de mi ciudad: __________________________", st_safety),
], AMBAR_SUAVE, borde=AMBAR_BORDE))
story.append(Spacer(1, 4))
story.append(Paragraph("Pedir ayuda es un acto de cuidado y de valentía, igual que el que tenés todos los días con "
                       "tu hijo o hija.", st_body))

# 9
seccion(9, "Mi plan personal de autocuidado")
plan = [
    "Una señal de que mi tanque está bajo:",
    "Dos estrategias (sección 3) que voy a probar esta semana:",
    "Una herramienta rápida (sección 5) que voy a tener a mano:",
    "Una persona a la que puedo pedir apoyo:",
    "Un momento del día que voy a proteger para mí:",
    "Si me cuesta sola/o, voy a contactar a:",
]
for p in plan:
    story.append(Paragraph(p, st_li))
    story.append(Paragraph("<font color='#9AA5B1'>______________________________________________________________</font>", st_li))
    story.append(Spacer(1, 5))

# 10
seccion(10, "Recursos")
story.append(vinetas([
    "<b>REDBOPEA</b> — Red Boliviana de Padres de Personas con Autismo. <i>(Agregar contacto, redes y actividades.)</i>",
    "<b>Equipo de salud de tu hijo/a</b> (pediatra, neurólogo, psicólogo, terapeutas).",
    "<b>Servicios de salud mental de tu ciudad.</b> <i>(Agregar nombres y teléfonos.)</i>",
    "<b>Línea de emergencias.</b> <i>(Agregar el número de tu localidad.)</i>",
]))
story.append(Spacer(1, 8))
story.append(caja([Paragraph("Esta guía se entrega como agradecimiento a las familias que participan en el estudio "
                             "sobre estrés parental y estrategias de afrontamiento. Hecha con respeto y gratitud por "
                             "lo que hacés cada día.", st_callout)], VERDE_SUAVE, borde=VERDE))

doc.build(story)
print("OK:", OUT)
