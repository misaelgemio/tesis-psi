// Diapositivas para proyectar durante el Taller para cuidadores (REDBOPEA).
// Contenido original. Genera docs/taller_diapositivas.pptx
const PptxGenJS = require("/tmp/pptxbuild/node_modules/pptxgenjs");
const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
const W = 13.333, H = 7.5;

const NAVY = "1E3A5F", NAVY2 = "2C5282", ICE = "EAF0F6", ICEBLUE = "CADCFC",
  WHITE = "FFFFFF", GREEN = "2F855A", GREENBG = "E6F4EA", AMBER = "C77C20",
  AMBERBG = "FFF4E0", GRAY = "4A5568", REDBG = "FBEAEA", RED = "9B2C2C";
const HF = "Georgia", BF = "Calibri";

const T = (s, o) => s.addText.bind(s);

function footer(s, n) {
  s.addText("REDBOPEA · Taller de manejo del estrés y afrontamiento", {
    x: 0.6, y: 7.05, w: 9, h: 0.3, fontFace: BF, fontSize: 9, color: GRAY,
  });
  s.addText(String(n), { x: 12.4, y: 7.05, w: 0.4, h: 0.3, fontFace: BF, fontSize: 9, color: GRAY, align: "right" });
}

// Motivo: círculo grande recortado (alude al "mapa de red")
function motivo(s, color) {
  s.addShape(pptx.ShapeType.ellipse, { x: 11.2, y: -1.4, w: 3.6, h: 3.6, fill: { color, transparency: 0 }, line: { type: "none" } });
}

function tituloSlide(s, titulo) {
  s.addText(titulo, { x: 0.6, y: 0.5, w: 11.6, h: 0.9, fontFace: HF, fontSize: 32, bold: true, color: NAVY });
}

// ---------- 1. Portada ----------
let s = pptx.addSlide();
s.background = { color: NAVY };
s.addShape(pptx.ShapeType.ellipse, { x: 9.8, y: -2.2, w: 6, h: 6, fill: { color: NAVY2 }, line: { type: "none" } });
s.addShape(pptx.ShapeType.ellipse, { x: 11.0, y: -1.0, w: 3.6, h: 3.6, fill: { color: NAVY }, line: { type: "none" } });
s.addText("Taller para cuidadores", { x: 0.8, y: 2.4, w: 11, h: 1.1, fontFace: HF, fontSize: 46, bold: true, color: WHITE });
s.addText("Manejo del estrés y estrategias de afrontamiento", { x: 0.8, y: 3.6, w: 11, h: 0.8, fontFace: BF, fontSize: 22, color: ICEBLUE });
s.addText("RED BOLIVIANA DE PADRES DE PERSONAS CON AUTISMO · REDBOPEA", { x: 0.8, y: 5.6, w: 11, h: 0.5, fontFace: BF, fontSize: 13, bold: true, color: WHITE, charSpacing: 1 });

// ---------- 2. Reglas del grupo ----------
s = pptx.addSlide(); s.background = { color: WHITE }; motivo(s, ICE);
tituloSlide(s, "Antes de empezar: nuestro espacio");
const reglas = [
  ["Confidencialidad", "Lo que se comparte aquí, queda aquí."],
  ["Voluntariedad", "Nadie está obligado a hablar. Siempre podés pasar."],
  ["Respeto y no juicio", "No se aconseja ni se corrige a nadie. Se escucha."],
  ["Cuidado", "Si algo moviliza mucho, está bien hacer una pausa."],
];
reglas.forEach((r, i) => {
  const y = 1.7 + i * 1.25;
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y, w: 0.7, h: 0.7, fill: { color: NAVY }, line: { type: "none" }, rectRadius: 0.1 });
  s.addText(String(i + 1), { x: 0.6, y, w: 0.7, h: 0.7, align: "center", valign: "middle", fontFace: HF, fontSize: 22, bold: true, color: WHITE });
  s.addText(r[0], { x: 1.6, y: y - 0.05, w: 10.5, h: 0.45, fontFace: HF, fontSize: 19, bold: true, color: NAVY });
  s.addText(r[1], { x: 1.6, y: y + 0.38, w: 10.5, h: 0.45, fontFace: BF, fontSize: 15, color: GRAY });
});
footer(s, 2);

// ---------- 3. Objetivos ----------
s = pptx.addSlide(); s.background = { color: WHITE }; motivo(s, ICE);
tituloSlide(s, "Hoy el foco son ustedes");
s.addText("Este no es un curso para hacerlo “bien”. Es un espacio para ustedes, que cuidan todos los días.",
  { x: 0.6, y: 1.5, w: 11.5, h: 0.8, fontFace: BF, fontSize: 17, italic: true, color: NAVY2 });
const objs = [
  ["Reconocer", "las señales y fuentes de tu estrés."],
  ["Identificar", "qué estrategias usás: las que suman y las que desgastan."],
  ["Practicar", "técnicas de calma y afrontamiento."],
  ["Diseñar", "tu plan personal de autocuidado y tu red de apoyo."],
];
objs.forEach((o, i) => {
  const x = 0.6 + (i % 2) * 6.1, y = 2.7 + Math.floor(i / 2) * 1.9;
  s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.7, h: 1.6, fill: { color: ICE }, line: { color: NAVY, width: 1 }, rectRadius: 0.08 });
  s.addText(o[0], { x: x + 0.3, y: y + 0.2, w: 5.1, h: 0.5, fontFace: HF, fontSize: 20, bold: true, color: NAVY });
  s.addText(o[1], { x: x + 0.3, y: y + 0.72, w: 5.1, h: 0.7, fontFace: BF, fontSize: 14.5, color: GRAY });
});
footer(s, 3);

// ---------- 4. Divider Sesión 1 ----------
s = pptx.addSlide(); s.background = { color: NAVY };
s.addShape(pptx.ShapeType.ellipse, { x: -1.6, y: 4.2, w: 5, h: 5, fill: { color: NAVY2 }, line: { type: "none" } });
s.addText("SESIÓN 1", { x: 0.8, y: 2.6, w: 11, h: 0.7, fontFace: BF, fontSize: 20, bold: true, color: ICEBLUE, charSpacing: 3 });
s.addText("Entender el estrés del cuidador", { x: 0.8, y: 3.3, w: 11.5, h: 1.1, fontFace: HF, fontSize: 40, bold: true, color: WHITE });

// ---------- 5. El tanque ----------
s = pptx.addSlide(); s.background = { color: WHITE };
tituloSlide(s, "El “tanque” del cuidador");
// dibujo de tanque
s.addShape(pptx.ShapeType.roundRect, { x: 5.4, y: 1.7, w: 2.5, h: 3.8, fill: { color: ICE }, line: { color: NAVY, width: 2 }, rectRadius: 0.15 });
s.addShape(pptx.ShapeType.rect, { x: 5.4, y: 3.9, w: 2.5, h: 1.6, fill: { color: ICEBLUE }, line: { type: "none" } });
s.addText("nivel\nactual", { x: 5.4, y: 4.3, w: 2.5, h: 0.8, align: "center", fontFace: BF, fontSize: 12, color: NAVY });
s.addText("¿Qué lo VACÍA?", { x: 0.6, y: 2.9, w: 4.4, h: 0.5, fontFace: HF, fontSize: 20, bold: true, color: RED, align: "right" });
s.addText("Lo que estresa, agota, preocupa…", { x: 0.6, y: 3.45, w: 4.4, h: 0.8, fontFace: BF, fontSize: 14, color: GRAY, align: "right" });
s.addText("¿Qué lo LLENA?", { x: 8.3, y: 2.9, w: 4.4, h: 0.5, fontFace: HF, fontSize: 20, bold: true, color: GREEN });
s.addText("Lo que descansa, conecta, recarga…", { x: 8.3, y: 3.45, w: 4.4, h: 0.8, fontFace: BF, fontSize: 14, color: GRAY });
s.addText("Recargar tu tanque también es cuidar a tu hijo o hija.", { x: 0.6, y: 5.9, w: 12, h: 0.6, align: "center", fontFace: BF, fontSize: 16, italic: true, bold: true, color: NAVY2 });
footer(s, 5);

// ---------- 6. Señales del estrés ----------
s = pptx.addSlide(); s.background = { color: WHITE };
tituloSlide(s, "Señales de que el tanque está bajo");
const cols = [
  ["En el cuerpo", ["Cansancio que no se va", "Dolores frecuentes", "Dormir mal o de más", "Enfermarte seguido"]],
  ["En las emociones", ["Irritabilidad", "Ganas de llorar", "Ansiedad constante", "Sentirte “en automático”"]],
  ["En lo que pensás/hacés", ["Aislarte", "Descuidarte", "“No puedo más”", "Perder el disfrute"]],
];
cols.forEach((c, i) => {
  const x = 0.6 + i * 4.1;
  s.addShape(pptx.ShapeType.rect, { x, y: 1.7, w: 3.9, h: 0.7, fill: { color: NAVY }, line: { type: "none" } });
  s.addText(c[0], { x: x + 0.1, y: 1.7, w: 3.7, h: 0.7, align: "center", valign: "middle", fontFace: HF, fontSize: 16, bold: true, color: WHITE });
  s.addShape(pptx.ShapeType.rect, { x, y: 2.4, w: 3.9, h: 2.7, fill: { color: ICE }, line: { color: ICEBLUE, width: 1 } });
  s.addText(c[1].map((t) => ({ text: t, options: { bullet: { code: "2022" }, breakLine: true, color: NAVY } })),
    { x: x + 0.25, y: 2.4, w: 3.5, h: 2.7, fontFace: BF, fontSize: 15, color: NAVY, valign: "middle", lineSpacingMultiple: 1.5 });
});
footer(s, 6);

// ---------- 7. Respiración 4-6 ----------
s = pptx.addSlide(); s.background = { color: WHITE }; motivo(s, ICE);
tituloSlide(s, "Herramienta: respiración 4–6");
s.addShape(pptx.ShapeType.ellipse, { x: 8.6, y: 2.0, w: 3.4, h: 3.4, fill: { color: ICE }, line: { color: NAVY, width: 2 } });
s.addText("4 – 6", { x: 8.6, y: 3.1, w: 3.4, h: 1.2, align: "center", fontFace: HF, fontSize: 44, bold: true, color: NAVY });
const pasos = [
  "Inhalá por la nariz contando 4.",
  "Exhalá lento por la boca contando 6.",
  "La exhalación larga le avisa al cuerpo que puede calmarse.",
  "Repetí 6 veces, sin apuro.",
];
s.addText(pasos.map((t, i) => ({ text: `${i + 1}.  ${t}`, options: { breakLine: true, paraSpaceAfter: 16 } })),
  { x: 0.6, y: 2.1, w: 7.7, h: 3.3, fontFace: BF, fontSize: 18, color: NAVY, valign: "middle", lineSpacingMultiple: 1.15 });
footer(s, 7);

// ---------- 8. 5-4-3-2-1 ----------
s = pptx.addSlide(); s.background = { color: WHITE };
tituloSlide(s, "Herramienta: anclaje 5-4-3-2-1");
s.addText("Cuando la mente se dispara, volvé al presente nombrando:", { x: 0.6, y: 1.5, w: 12, h: 0.5, fontFace: BF, fontSize: 16, color: GRAY });
const anc = [["5", "cosas que ves"], ["4", "que oís"], ["3", "que podés tocar"], ["2", "que olés"], ["1", "que saboreás"]];
anc.forEach((a, i) => {
  const x = 0.6 + i * 2.48;
  s.addShape(pptx.ShapeType.ellipse, { x, y: 2.5, w: 1.7, h: 1.7, fill: { color: NAVY }, line: { type: "none" } });
  s.addText(a[0], { x, y: 2.5, w: 1.7, h: 1.7, align: "center", valign: "middle", fontFace: HF, fontSize: 40, bold: true, color: WHITE });
  s.addText(a[1], { x: x - 0.25, y: 4.35, w: 2.2, h: 0.8, align: "center", fontFace: BF, fontSize: 14, color: NAVY });
});
footer(s, 8);

// ---------- 9. Divider Sesión 2 ----------
s = pptx.addSlide(); s.background = { color: NAVY };
s.addShape(pptx.ShapeType.ellipse, { x: 10.0, y: 3.8, w: 5.2, h: 5.2, fill: { color: NAVY2 }, line: { type: "none" } });
s.addText("SESIÓN 2", { x: 0.8, y: 2.6, w: 11, h: 0.7, fontFace: BF, fontSize: 20, bold: true, color: ICEBLUE, charSpacing: 3 });
s.addText("Afrontamiento y plan personal", { x: 0.8, y: 3.3, w: 11.5, h: 1.1, fontFace: HF, fontSize: 40, bold: true, color: WHITE });

// ---------- 10. ¿Qué hago cuando me supera? ----------
s = pptx.addSlide(); s.background = { color: WHITE };
tituloSlide(s, "¿Qué hago cuando me supera?");
const grupos = [
  ["Me ayudan", GREEN, GREENBG, "Resolver, planificar, pedir apoyo, aceptar, mirar distinto"],
  ["Evito el problema", AMBER, AMBERBG, "Distraerme todo el tiempo, desahogarme sin parar"],
  ["Me desgastan", RED, REDBG, "Negar, desconectarme, culparme, sustancias"],
];
grupos.forEach((g, i) => {
  const x = 0.6 + i * 4.1;
  s.addShape(pptx.ShapeType.rect, { x, y: 1.8, w: 3.9, h: 0.7, fill: { color: g[1] }, line: { type: "none" } });
  s.addText(g[0], { x, y: 1.8, w: 3.9, h: 0.7, align: "center", valign: "middle", fontFace: HF, fontSize: 17, bold: true, color: WHITE });
  s.addShape(pptx.ShapeType.rect, { x, y: 2.5, w: 3.9, h: 2.4, fill: { color: g[2] }, line: { type: "none" } });
  s.addText(g[3], { x: x + 0.3, y: 2.5, w: 3.3, h: 2.4, fontFace: BF, fontSize: 15.5, color: NAVY, valign: "middle", lineSpacingMultiple: 1.35 });
});
s.addText("No hay personas buenas o malas afrontando: hay estrategias más útiles según el momento.",
  { x: 0.6, y: 5.4, w: 12, h: 0.6, align: "center", fontFace: BF, fontSize: 15, italic: true, color: NAVY2 });
footer(s, 10);

// ---------- 11. Afrontar que suma ----------
s = pptx.addSlide(); s.background = { color: WHITE }; motivo(s, GREENBG);
tituloSlide(s, "Afrontar de un modo que suma");
const suma = [
  ["Resolver lo posible", "¿Qué parte sí está en mis manos? Un paso pequeño."],
  ["Pedir apoyo", "Emocional (que me escuchen) y práctico (delegar)."],
  ["Mirar distinto", "¿Qué aprendí? ¿Qué avance hubo hoy?"],
  ["Aceptar lo que no cambia", "Soltar la pelea con lo imposible."],
  ["Cuidar el cuerpo", "Sueño, movimiento, comer, respirar."],
  ["Tiempo propio", "5–10 minutos al día que sean míos."],
];
suma.forEach((r, i) => {
  const x = 0.6 + (i % 2) * 6.1, y = 1.7 + Math.floor(i / 2) * 1.55;
  s.addShape(pptx.ShapeType.ellipse, { x, y: y + 0.05, w: 0.45, h: 0.45, fill: { color: GREEN }, line: { type: "none" } });
  s.addText(r[0], { x: x + 0.65, y, w: 5.3, h: 0.45, fontFace: HF, fontSize: 17, bold: true, color: NAVY });
  s.addText(r[1], { x: x + 0.65, y: y + 0.45, w: 5.3, h: 0.7, fontFace: BF, fontSize: 13.5, color: GRAY });
});
footer(s, 11);

// ---------- 12. Mi red de apoyo ----------
s = pptx.addSlide(); s.background = { color: WHITE };
tituloSlide(s, "Mi red de apoyo");
const radios = [[2.6, ICE], [2.0, ICEBLUE], [1.4, ICE], [0.8, ICEBLUE]];
const cx = 9.5, cy = 4.4;
radios.forEach(([r, col]) => {
  s.addShape(pptx.ShapeType.ellipse, { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: { color: col }, line: { color: NAVY, width: 1 } });
});
s.addText("YO", { x: cx - 0.8, y: cy - 0.4, w: 1.6, h: 0.8, align: "center", valign: "middle", margin: 0, fontFace: HF, fontSize: 16, bold: true, color: NAVY });
const circulos = [
  ["Íntimo", "pareja, familia cercana"],
  ["Cercano", "amistades, otras familias"],
  ["Profesional", "médicos, terapeutas, escuela"],
  ["Comunitario", "grupos, iglesia, vecinos"],
];
circulos.forEach((c, i) => {
  const y = 1.8 + i * 1.05;
  s.addText([{ text: c[0] + ":  ", options: { bold: true, color: NAVY } }, { text: c[1], options: { color: GRAY } }],
    { x: 0.6, y, w: 5.6, h: 0.7, fontFace: BF, fontSize: 16 });
});
s.addText("¿Qué círculo está más “flaco”? Ahí hay una oportunidad para sumar apoyo.",
  { x: 0.6, y: 6.0, w: 7.5, h: 0.8, fontFace: BF, fontSize: 14, italic: true, color: NAVY2 });
footer(s, 12);

// ---------- 13. Mi plan personal ----------
s = pptx.addSlide(); s.background = { color: WHITE }; motivo(s, ICE);
tituloSlide(s, "Mi plan personal de autocuidado");
const plan = [
  "Una señal de que mi tanque está bajo",
  "Dos estrategias que voy a probar esta semana",
  "Una técnica rápida que tendré a mano",
  "Una persona a la que puedo pedir apoyo",
  "Un momento del día que voy a proteger para mí",
  "A quién contacto si me cuesta sola/o",
];
s.addText(plan.map((t) => ({ text: t, options: { bullet: { code: "2713" }, color: NAVY } })),
  { x: 0.6, y: 1.8, w: 11.8, h: 4.6, fontFace: BF, fontSize: 19, color: NAVY, lineSpacingMultiple: 1.7, paraSpaceAfter: 10 });
footer(s, 13);

// ---------- 14. Cierre ----------
s = pptx.addSlide(); s.background = { color: NAVY };
s.addShape(pptx.ShapeType.ellipse, { x: 9.6, y: -2.0, w: 6, h: 6, fill: { color: NAVY2 }, line: { type: "none" } });
s.addText("Gracias por estar acá", { x: 0.8, y: 2.5, w: 11.5, h: 1.0, fontFace: HF, fontSize: 40, bold: true, color: WHITE });
s.addText("Cuidarte no es egoísmo. Es parte del cuidado.", { x: 0.8, y: 3.7, w: 11.5, h: 0.7, fontFace: BF, fontSize: 22, italic: true, color: ICEBLUE });
s.addText("REDBOPEA", { x: 0.8, y: 5.7, w: 11, h: 0.5, fontFace: BF, fontSize: 14, bold: true, color: WHITE, charSpacing: 2 });

pptx.writeFile({ fileName: "docs/taller_diapositivas.pptx" }).then((f) => console.log("OK:", f));
