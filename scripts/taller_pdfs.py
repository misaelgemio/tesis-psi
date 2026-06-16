# -*- coding: utf-8 -*-
"""Genera dos PDFs del taller (contenido original):
 1) Guía del facilitador maquetada.
 2) Hojas para participantes (mapa de red, plan personal, evaluación).
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    ListFlowable, ListItem, PageBreak, NextPageTemplate, Flowable,
)

MARCA = colors.HexColor("#1E3A5F")
MARCA_CLARO = colors.HexColor("#2C5282")
FONDO_SUAVE = colors.HexColor("#EAF0F6")
VERDE = colors.HexColor("#2F855A")
VERDE_SUAVE = colors.HexColor("#E6F4EA")
AMBAR_SUAVE = colors.HexColor("#FFF4E0")
AMBAR_BORDE = colors.HexColor("#E0A53F")
GRIS = colors.HexColor("#4A5568")
LINEA = colors.HexColor("#9AA5B1")

styles = getSampleStyleSheet()
PAGE_W, PAGE_H = A4


def S(name, **kw):
    base = kw.pop("parent", styles["Normal"])
    return ParagraphStyle(name, parent=base, **kw)


st_titulo = S("titulo", fontName="Helvetica-Bold", fontSize=24, textColor=colors.white, leading=28, alignment=TA_CENTER)
st_subtitulo = S("subtitulo", fontName="Helvetica", fontSize=12, textColor=colors.white, leading=17, alignment=TA_CENTER)
st_marca = S("marca", fontName="Helvetica-Bold", fontSize=10.5, textColor=colors.white, alignment=TA_CENTER, leading=14)
st_h = S("h", fontName="Helvetica-Bold", fontSize=14, textColor=MARCA, leading=18, spaceBefore=10, spaceAfter=4)
st_h2 = S("h2", fontName="Helvetica-Bold", fontSize=11.5, textColor=MARCA_CLARO, leading=15, spaceBefore=6, spaceAfter=3)
st_body = S("body", fontSize=10.5, leading=15, textColor=colors.HexColor("#222222"), spaceAfter=4)
st_callout = S("callout", fontSize=10.5, leading=15, textColor=MARCA)
st_callout_b = S("callout_b", fontSize=11, leading=15, textColor=MARCA, fontName="Helvetica-Bold")
st_li = S("li", fontSize=10, leading=14, textColor=colors.HexColor("#222222"))
st_small = S("small", fontSize=8.5, leading=11, textColor=GRIS)
st_th = S("th", fontName="Helvetica-Bold", fontSize=9.5, textColor=colors.white, leading=12)
st_thd = S("thd", fontName="Helvetica-Bold", fontSize=9.5, textColor=MARCA, leading=12)
st_td = S("td", fontSize=9, leading=12, textColor=colors.HexColor("#222222"))
st_safety = S("safety", fontSize=10.5, leading=15, textColor=colors.HexColor("#7B341E"))
st_field = S("field", fontSize=11, leading=16, textColor=MARCA, fontName="Helvetica-Bold")


def caja(parrafos, fondo, borde=None, pad=10, ancho=160):
    t = Table([[parrafos]], colWidths=[ancho * mm])
    estilo = [
        ("BACKGROUND", (0, 0), (-1, -1), fondo),
        ("LEFTPADDING", (0, 0), (-1, -1), pad), ("RIGHTPADDING", (0, 0), (-1, -1), pad),
        ("TOPPADDING", (0, 0), (-1, -1), pad), ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]
    if borde:
        estilo += [("LINEBEFORE", (0, 0), (0, -1), 3, borde), ("BOX", (0, 0), (-1, -1), 0.5, borde)]
    t.setStyle(TableStyle(estilo))
    return t


def vinetas(items):
    return ListFlowable(
        [ListItem(Paragraph(t, st_li), leftIndent=6, value="•") for t in items],
        bulletType="bullet", bulletColor=MARCA, bulletFontSize=10, leftIndent=12,
    )


def agenda(filas):
    data = [[Paragraph("Tiempo", st_th), Paragraph("Bloque", st_th), Paragraph("Qué se hace", st_th)]]
    for tiempo, bloque, que in filas:
        data.append([Paragraph(tiempo, st_td), Paragraph(f"<b>{bloque}</b>", st_td), Paragraph(que, st_td)])
    t = Table(data, colWidths=[22 * mm, 40 * mm, 98 * mm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), MARCA),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, FONDO_SUAVE]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C9D6E5")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


def lineas_para_escribir(n=1, ancho=160):
    flow = []
    for _ in range(n):
        flow.append(Spacer(1, 7 * mm))
        t = Table([[""]], colWidths=[ancho * mm])
        t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.6, LINEA)]))
        flow.append(t)
    return flow


# ---------- Plantillas de página ----------
def hacer_doc(path, titulo, con_portada=True):
    doc = BaseDocTemplate(path, pagesize=A4, leftMargin=25 * mm, rightMargin=25 * mm,
                          topMargin=22 * mm, bottomMargin=18 * mm, title=titulo, author="REDBOPEA")

    def pie(canvas, d):
        canvas.saveState()
        canvas.setFont("Helvetica", 8); canvas.setFillColor(GRIS)
        if d.page > 1:
            canvas.drawCentredString(PAGE_W / 2, 10 * mm, f"REDBOPEA · {titulo} · {d.page}")
        canvas.restoreState()

    def portada(canvas, d):
        canvas.saveState()
        canvas.setFillColor(MARCA); canvas.rect(0, PAGE_H - 115 * mm, PAGE_W, 115 * mm, fill=1, stroke=0)
        canvas.setFillColor(MARCA_CLARO); canvas.rect(0, PAGE_H - 119 * mm, PAGE_W, 4 * mm, fill=1, stroke=0)
        canvas.restoreState(); pie(canvas, d)

    plantillas = [
        PageTemplate(id="main", frames=[Frame(25 * mm, 18 * mm, PAGE_W - 50 * mm, PAGE_H - 40 * mm)], onPage=pie),
    ]
    if con_portada:
        # La portada va primera para que la use la página 1.
        plantillas.insert(0, PageTemplate(id="portada",
                          frames=[Frame(25 * mm, 18 * mm, PAGE_W - 50 * mm, PAGE_H - 40 * mm)], onPage=portada))
    doc.addPageTemplates(plantillas)
    return doc


# ============================================================
# 1) GUÍA DEL FACILITADOR
# ============================================================
g = []
g.append(Spacer(1, 16 * mm))
g.append(Paragraph("Taller para cuidadores", st_titulo))
g.append(Spacer(1, 3 * mm))
g.append(Paragraph("Manejo del estrés y estrategias de afrontamiento", st_subtitulo))
g.append(Spacer(1, 5 * mm))
g.append(Paragraph("GUÍA DEL FACILITADOR · REDBOPEA", st_marca))
g.append(Spacer(1, 34 * mm))
g.append(caja([Paragraph("Actividad de devolución a la comunidad del estudio sobre estrés parental y afrontamiento. "
                         "Facilita idealmente un(a) psicólogo/a: algunas dinámicas tocan emociones intensas "
                         "(ver Notas para el facilitador).", st_callout)], FONDO_SUAVE, borde=MARCA))
g.append(NextPageTemplate("main"))
g.append(PageBreak())

# Ficha técnica
g.append(Paragraph("1. Ficha técnica", st_h))
ficha = [
    ("Dirigido a", "Cuidadoras y cuidadores primarios de adolescentes (10–19 años) con TEA."),
    ("Tamaño del grupo", "8 a 15 personas (ideal 10–12)."),
    ("Formato", "2 sesiones de 2 h (recomendado). Versión corta: 1 sesión de 2 h 30 min."),
    ("Modalidad", "Presencial, en círculo. Adaptable a virtual."),
    ("Materiales", "Papelógrafos, marcadores, hojas, lápices, tarjetas/post-its, folleto impreso, agua."),
    ("Clima", "Confidencial, voluntario, sin juicio. No es terapia ni evaluación."),
]
data = [[Paragraph(f"<b>{k}</b>", st_thd), Paragraph(v, st_td)] for k, v in ficha]
tf = Table(data, colWidths=[40 * mm, 120 * mm])
tf.setStyle(TableStyle([
    ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, FONDO_SUAVE]),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C9D6E5")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
g.append(tf)
g.append(Paragraph("Objetivos", st_h2))
g.append(Paragraph("Al finalizar, las personas participantes podrán:", st_body))
g.append(ListFlowable([
    ListItem(Paragraph("<b>Reconocer</b> las señales y fuentes de su estrés como cuidadores.", st_li), value="1"),
    ListItem(Paragraph("<b>Identificar</b> las estrategias de afrontamiento que usan y distinguir las que suman de las que desgastan.", st_li), value="2"),
    ListItem(Paragraph("<b>Practicar</b> al menos tres técnicas de regulación y afrontamiento adaptativo.", st_li), value="3"),
    ListItem(Paragraph("<b>Diseñar</b> un plan personal de autocuidado y fortalecer su red de apoyo.", st_li), value="4"),
], bulletType="1", leftIndent=14))

# Encuadre
g.append(Paragraph("2. Encuadre (10 min al inicio)", st_h))
g.append(Paragraph("Acordar en voz alta las reglas del grupo y escribirlas en un papelógrafo visible:", st_body))
g.append(vinetas([
    "<b>Confidencialidad:</b> lo que se comparte aquí, queda aquí.",
    "<b>Voluntariedad:</b> nadie está obligado a hablar; se puede pasar.",
    "<b>Respeto y no juicio:</b> no se aconseja ni se corrige a nadie; se escucha.",
    "<b>Cuidado:</b> si algo moviliza mucho, está bien hacer una pausa.",
]))
g.append(caja([Paragraph("Apertura sugerida: <i>“Este no es un curso para hacerlo bien. Es un espacio para ustedes, "
                         "que cuidan todos los días. Hoy el foco son ustedes.”</i>", st_callout)], VERDE_SUAVE, borde=VERDE))

# Sesión 1
g.append(PageBreak())
g.append(Paragraph("3. Sesión 1 — Entender el estrés del cuidador (2 h)", st_h))
g.append(agenda([
    ("0:00–0:10", "Bienvenida y encuadre", "Presentación, reglas del grupo, objetivos del taller."),
    ("0:10–0:25", "Rompehielo: “¿Cómo llego hoy?”", "Cada quien elige una palabra o tarjeta que describa cómo llega. Ronda breve. Normaliza el cansancio."),
    ("0:25–0:50", "Dinámica del “tanque”", "Dibujar un tanque. Lluvia de ideas: ¿qué lo vacía? ¿qué lo llena? Cierre: recargar el tanque también es cuidar al hijo/a."),
    ("0:50–1:05", "Psicoeducación: señales", "Señales del estrés (cuerpo, emociones, conducta), con ejemplos. Apoyo: folleto sección 2."),
    ("1:05–1:15", "Pausa", "Agua, movimiento."),
    ("1:15–1:35", "Práctica: respiración 4–6 y 5-4-3-2-1", "Guiar ambas técnicas en vivo, despacio."),
    ("1:35–1:55", "Parejas: “mi señal de alarma”", "Cada quien identifica 1 señal personal y 1 cosa pequeña que recarga. Comparten si quieren."),
    ("1:55–2:00", "Cierre y puente", "Frase de cierre, “tarea suave” y anuncio de la sesión 2."),
]))
g.append(Spacer(1, 4))
g.append(caja([Paragraph("<b>Tarea suave (opcional):</b> durante la semana, notar una vez la señal de alarma propia "
                         "y probar una técnica de respiración. Sin presión.", st_callout)], FONDO_SUAVE, borde=MARCA))

# Sesión 2
g.append(PageBreak())
g.append(Paragraph("4. Sesión 2 — Afrontamiento y plan personal (2 h)", st_h))
g.append(agenda([
    ("0:00–0:10", "Reencuentro", "Ronda corta: ¿cómo les fue con la señal de alarma? Recuerdo de las reglas."),
    ("0:10–0:35", "“¿Qué hago cuando me supera?”", "En tarjetas anónimas. Se agrupan en: las que ayudan / evito el problema / me desgastan. Sin señalar a nadie."),
    ("0:35–0:55", "Psicoeducación: afrontar que sume", "Estrategias adaptativas y las que conviene reducir. Apoyo: folleto secciones 3 y 4."),
    ("0:55–1:05", "Pausa", ""),
    ("1:05–1:30", "Mapa de mi red de apoyo", "Dibujar los cuatro círculos. Identificar un círculo “flaco” y una acción para reforzarlo."),
    ("1:30–1:50", "Mi plan personal de autocuidado", "Completar la plantilla (folleto sección 9)."),
    ("1:50–2:00", "Cierre en círculo y evaluación", "Ronda de una palabra, agradecimiento, evaluación anónima, entrega del folleto."),
]))

# Versión corta + evaluación + materiales
g.append(PageBreak())
g.append(Paragraph("5. Versión corta (1 sesión de 2 h 30)", st_h))
g.append(vinetas([
    "Encuadre + rompehielo (15 min)", "Dinámica del tanque (20 min)",
    "Psicoeducación: estrés + afrontamiento (25 min)", "Pausa (10 min)",
    "Prácticas: respiración 4–6 y 5-4-3-2-1 (20 min)", "Mapa de red de apoyo (20 min)",
    "Plan personal de autocuidado (25 min)", "Cierre + evaluación (15 min)",
]))
g.append(Paragraph("6. Materiales para preparar", st_h))
g.append(vinetas([
    "Papelógrafo “Reglas del grupo” y dibujo del “tanque”.",
    "Tarjetas/post-its, marcadores, hojas en blanco.",
    "Folleto de autocuidado impreso (uno por participante).",
    "Hojas para participantes (mapa de red, plan, evaluación).",
    "Lista de recursos y derivación de tu ciudad (salud mental, emergencias).",
]))

# Notas facilitador
g.append(PageBreak())
g.append(Paragraph("7. Notas para el facilitador", st_h))
g.append(vinetas([
    "<b>Tu rol es contener y facilitar, no diagnosticar ni dar consejos médicos.</b> Devolvé al grupo en vez de aconsejar.",
    "<b>Si alguien se moviliza:</b> validá, ofrecé una pausa, no fuerces a seguir hablando.",
    "<b>Si alguien revela riesgo</b> (ideas de hacerse daño, violencia, consumo grave): atendelo en privado al cierre y derivá; ante riesgo inminente, activá el protocolo de emergencia local.",
    "<b>Cuidá los tiempos</b> pero priorizá el clima.",
    "<b>Inclusión:</b> lenguaje sencillo, respetá silencios, ofrecé siempre la opción de “paso”.",
    "<b>Tu propio cuidado:</b> facilitar también cansa; hacé tu cierre después de cada sesión.",
]))
g.append(caja([
    Paragraph("Relación con el estudio", st_callout_b),
    Spacer(1, 3),
    Paragraph("El taller es un agradecimiento y una devolución; no es parte de la recolección de datos. La "
              "asistencia no condiciona la participación en el estudio, y la lista de asistencia se maneja separada "
              "de las respuestas anónimas.", st_safety),
], AMBAR_SUAVE, borde=AMBAR_BORDE))

doc_g = hacer_doc("docs/taller_guia_facilitador.pdf", "Taller · Guía del facilitador")
doc_g.build(g)
print("OK: docs/taller_guia_facilitador.pdf")


# ============================================================
# 2) HOJAS PARA PARTICIPANTES
# ============================================================
class RedApoyo(Flowable):
    """Cuatro círculos concéntricos rotulados para escribir nombres."""
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def wrap(self, *args):
        return (self.width, self.height)

    def draw(self):
        c = self.canv
        cx, cy = self.width / 2, self.height / 2
        radios = [62 * mm, 46 * mm, 30 * mm, 14 * mm]
        fills = [colors.white, FONDO_SUAVE, colors.white, FONDO_SUAVE]
        etiquetas = ["Comunitario (grupos, iglesia, vecinos)", "Profesional (médicos, terapeutas, escuela)",
                     "Cercano (amistades, otras familias)", "Íntimo (pareja, familia cercana)"]
        for r, f in zip(radios, fills):
            c.setFillColor(f)
            c.setStrokeColor(MARCA)
            c.setLineWidth(0.8)
            c.circle(cx, cy, r, stroke=1, fill=1)
        # etiquetas cerca del borde superior de cada anillo
        c.setFont("Helvetica-Oblique", 8)
        c.setFillColor(GRIS)
        for r, et in zip(radios, etiquetas):
            c.drawCentredString(cx, cy + r - 4.2 * mm, et)
        # centro
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(MARCA)
        c.drawCentredString(cx, cy - 1.2 * mm, "YO")


p = []
p.append(Paragraph("Mapa de mi red de apoyo", st_h))
p.append(Paragraph("Escribí, en cada anillo, los nombres de quienes te acompañan. Mirá qué anillo está más “flaco”: "
                   "ahí hay una oportunidad para pedir o sumar apoyo.", st_body))
p.append(Spacer(1, 4 * mm))
p.append(RedApoyo(160 * mm, 130 * mm))
p.append(Spacer(1, 6 * mm))
p.append(Paragraph("Un círculo que quiero reforzar esta semana:", st_field))
p += lineas_para_escribir(1)
p.append(Paragraph("Una acción concreta para reforzarlo:", st_field))
p += lineas_para_escribir(1)

p.append(PageBreak())
p.append(Paragraph("Mi plan personal de autocuidado", st_h))
p.append(Paragraph("Completá con tus propias palabras. Es tuyo: llevátelo y ponelo donde puedas verlo.", st_body))
campos = [
    "Una señal de que mi tanque está bajo:",
    "Dos estrategias que voy a probar esta semana:",
    "Una técnica rápida que voy a tener a mano (respiración 4–6, 5-4-3-2-1…):",
    "Una persona a la que puedo pedir apoyo:",
    "Un momento del día que voy a proteger para mí:",
    "Si me cuesta sola/o, voy a contactar a:",
]
for campo in campos:
    p.append(Spacer(1, 3 * mm))
    p.append(Paragraph(campo, st_field))
    p += lineas_para_escribir(1)

p.append(PageBreak())
p.append(Paragraph("Evaluación del taller (anónima)", st_h))
p.append(Paragraph("Tus respuestas nos ayudan a mejorar el taller. No se vinculan con el estudio.", st_body))
p.append(Spacer(1, 3 * mm))
preguntas = [
    "1. ¿El taller te resultó útil?   1   2   3   4   5   (1 = nada · 5 = mucho)",
    "2. ¿Te llevás al menos una herramienta para usar? ¿Cuál?",
    "3. ¿Cómo te sentiste en el grupo?   1   2   3   4   5   (1 = incómoda/o · 5 = muy a gusto)",
    "4. ¿Qué te gustaría que tuviera más o menos?",
    "5. Una palabra para describir tu experiencia:",
]
for q in preguntas:
    p.append(Spacer(1, 2 * mm))
    p.append(Paragraph(q, st_field))
    p += lineas_para_escribir(1)
p.append(Spacer(1, 6 * mm))
p.append(caja([Paragraph("Gracias por tu tiempo y por todo lo que hacés cada día. — REDBOPEA", st_callout)],
              VERDE_SUAVE, borde=VERDE))

doc_p = hacer_doc("docs/taller_hojas_participantes.pdf", "Taller · Hojas para participantes", con_portada=False)
doc_p.build(p)
print("OK: docs/taller_hojas_participantes.pdf")
