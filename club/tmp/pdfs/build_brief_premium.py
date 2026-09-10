from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "brief-comercial.pdf"
W, H = A4

INK = HexColor("#171B1A")
IVORY = HexColor("#F4F1E9")
PAPER = HexColor("#FBFAF6")
WHITE = HexColor("#FFFFFF")
TEXT = HexColor("#4E5451")
MUTED = HexColor("#7A807C")
GOLD = HexColor("#C3A66B")
GOLD_SOFT = HexColor("#E8DDC4")
SAGE = HexColor("#718077")
SAGE_SOFT = HexColor("#DCE3DE")
LINE = HexColor("#D7D3C9")

pdfmetrics.registerFont(
    TTFont("Editorial", "/System/Library/Fonts/Supplemental/Georgia.ttf")
)
pdfmetrics.registerFont(
    TTFont("EditorialBold", "/System/Library/Fonts/Supplemental/Georgia Bold.ttf")
)
pdfmetrics.registerFont(
    TTFont("Sans", "/System/Library/Fonts/Supplemental/Trebuchet MS.ttf")
)
pdfmetrics.registerFont(
    TTFont("SansBold", "/System/Library/Fonts/Supplemental/Trebuchet MS Bold.ttf")
)


def lines(text, font, size, width):
    result, current = [], ""
    for word in text.split():
        trial = word if not current else current + " " + word
        if pdfmetrics.stringWidth(trial, font, size) <= width:
            current = trial
        else:
            if current:
                result.append(current)
            current = word
    if current:
        result.append(current)
    return result


def para(c, text, x, y, width, size=8.5, leading=11.5, color=TEXT, font="Sans", limit=None):
    content = lines(text, font, size, width)
    if limit:
        content = content[:limit]
    c.setFont(font, size)
    c.setFillColor(color)
    for line in content:
        c.drawString(x, y, line)
        y -= leading
    return y


def label(c, text, x, y, color=GOLD):
    c.setFont("SansBold", 7.2)
    c.setFillColor(color)
    c.drawString(x, y, text.upper())


def rounded(c, x, y, w, h, radius=12, fill=PAPER, stroke=None, lw=.8):
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(lw)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1 if stroke else 0)


def arrow(c, x, y, direction="up", color=INK):
    c.setStrokeColor(color)
    c.setLineWidth(1.7)
    if direction == "down":
        c.line(x, y + 5, x, y - 5)
        c.line(x, y - 5, x - 3.5, y - 1)
        c.line(x, y - 5, x + 3.5, y - 1)
    else:
        c.line(x, y - 5, x, y + 5)
        c.line(x, y + 5, x - 3.5, y + 1)
        c.line(x, y + 5, x + 3.5, y + 1)


def check(c, x, y, color=SAGE):
    c.setStrokeColor(color)
    c.setLineWidth(1.6)
    c.line(x, y, x + 3, y - 3)
    c.line(x + 3, y - 3, x + 8, y + 4)


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("Brief comercial")
    c.setAuthor("")
    c.setSubject("Sistema de recompra y crecimiento para comercios")

    c.setFillColor(IVORY)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Cabecera editorial, deliberadamente sin logo ni nombre de marca.
    hero_h = 245
    c.setFillColor(INK)
    c.rect(0, H - hero_h, W, hero_h, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(42, H - 54, 27, 2, fill=1, stroke=0)
    label(c, "Brief comercial / 2026", 80, H - 58, GOLD_SOFT)

    c.setFont("EditorialBold", 30)
    c.setFillColor(WHITE)
    c.drawString(42, H - 103, "Aumentá tus ventas")
    c.setFillColor(GOLD_SOFT)
    c.drawString(42, H - 141, "sin invertir")
    c.setFillColor(WHITE)
    c.drawString(42, H - 179, "en publicidad.")

    c.setStrokeColor(HexColor("#3B413E"))
    c.setLineWidth(.8)
    c.line(355, H - 196, 355, H - 68)
    label(c, "La idea", 382, H - 84, GOLD_SOFT)
    para(
        c,
        "Usar los clientes y las compras que el negocio ya tiene para generar nuevas ventas.",
        382,
        H - 111,
        160,
        10,
        14,
        WHITE,
        "SansBold",
    )
    para(
        c,
        "Cada operación deja datos útiles. Esos datos permiten segmentar, personalizar el contacto y activar la recompra.",
        382,
        H - 165,
        160,
        8.2,
        11.2,
        HexColor("#C9CFCC"),
        "Sans",
    )

    # Impacto comercial medible.
    label(c, "Impacto comercial", 42, 566, SAGE)
    c.setFont("EditorialBold", 15)
    c.setFillColor(INK)
    c.drawString(42, 542, "Más valor por cada cliente que ya entra al negocio.")

    kpis = [
        ("down", "Costo por compra", "Reactivá la base actual antes de pagar por nueva demanda."),
        ("up", "Tasa de recompra", "Contactá según la última compra y el ciclo real del cliente."),
        ("up", "Valor por cliente", "Aumentá frecuencia y oportunidades relevantes en el tiempo."),
        ("up", "Base de datos propia", "Construí un activo comercial que queda en el negocio."),
    ]
    kpi_w = (W - 84) / 4
    for i, (direction, heading, body) in enumerate(kpis):
        x = 42 + i * kpi_w
        if i:
            c.setStrokeColor(LINE)
            c.setLineWidth(.8)
            c.line(x, 456, x, 518)
        arrow(c, x + 8, 504, direction, GOLD if i in (0, 2) else SAGE)
        c.setFont("SansBold", 8.4)
        c.setFillColor(INK)
        c.drawString(x + 22, 500, heading)
        para(c, body, x + 8, 477, kpi_w - 17, 7.25, 9.7, TEXT)

    c.setStrokeColor(LINE)
    c.line(42, 438, W - 42, 438)

    # Columna izquierda: el sistema.
    label(c, "Cómo funciona", 42, 414, SAGE)
    c.setFont("EditorialBold", 16)
    c.setFillColor(INK)
    c.drawString(42, 389, "De cada compra a la recompra.")

    steps = [
        ("01", "Captamos datos específicos", "Definimos qué información sirve para el rubro: contacto, preferencias, frecuencia y consentimiento."),
        ("02", "Centralizamos catálogo / carta y pedidos", "El cliente compra en el local o desde afuera, con retiro o envío, dentro de una experiencia propia."),
        ("03", "Registramos clientes y compras", "Producto, fecha, canal y comportamiento quedan vinculados a un historial individual."),
        ("04", "Activamos email personalizado", "Segmentamos por conducta real para enviar recordatorios, novedades y propuestas relevantes."),
    ]
    base_y = 350
    for i, (num, heading, body) in enumerate(steps):
        y = base_y - i * 58
        c.setFillColor(GOLD if i in (0, 3) else SAGE)
        c.circle(55, y + 4, 12, fill=1, stroke=0)
        c.setFont("SansBold", 6.3)
        c.setFillColor(WHITE)
        c.drawCentredString(55, y + 2, num)
        c.setFont("SansBold", 9.3)
        c.setFillColor(INK)
        c.drawString(76, y + 10, heading)
        para(c, body, 76, y - 6, 222, 7.3, 9.4, TEXT)

    # Columna derecha: alcance y datos disponibles.
    rounded(c, 326, 173, 227, 235, 14, PAPER, LINE)
    label(c, "Qué incorpora", 345, 383, SAGE)
    c.setFont("EditorialBold", 15)
    c.setFillColor(INK)
    c.drawString(345, 359, "Una operación conectada.")

    features = [
        "Catálogo / carta digital con identidad propia",
        "Pedidos en el local, retiro y envío",
        "Perfil e historial de cada cliente",
        "Segmentos por frecuencia y productos",
        "Email marketing adaptado a cada comercio",
        "Puntos, beneficios y referidos",
    ]
    for i, item in enumerate(features):
        y = 332 - i * 22
        check(c, 346, y + 2, GOLD if i in (0, 4) else SAGE)
        para(c, item, 361, y + 5, 172, 7.9, 10, INK, "Sans", 2)

    c.setStrokeColor(LINE)
    c.line(345, 207, 534, 207)
    c.setFont("SansBold", 7.4)
    c.setFillColor(SAGE)
    c.drawString(345, 193, "DATOS QUE QUEDAN EN EL NEGOCIO")
    c.setFont("Sans", 6.8)
    c.setFillColor(TEXT)
    c.drawString(345, 180, "Contacto · productos · ticket · fecha · canal · frecuencia")

    # Cierre.
    rounded(c, 42, 51, W - 84, 91, 14, INK)
    label(c, "Resultado", 60, 119, GOLD_SOFT)
    c.setFont("EditorialBold", 19)
    c.setFillColor(WHITE)
    c.drawString(60, 91, "Cada compra alimenta la próxima.")
    para(
        c,
        "Más recompra, menor costo por operación y menos dependencia de la adquisición paga.",
        60,
        70,
        447,
        8.7,
        11,
        HexColor("#C9CFCC"),
    )

    c.setFont("Sans", 6.6)
    c.setFillColor(MUTED)
    c.drawString(42, 26, "Propuesta de alcance configurable según la operación de cada negocio.")
    c.drawRightString(W - 42, 26, "01")

    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build()
