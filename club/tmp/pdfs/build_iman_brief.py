from __future__ import annotations

from pathlib import Path
from typing import Callable, Iterable

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "brief-comercial-iman.pdf"

W, H = A4

# Identidad visual tomada de la landing de Imán Club.
INK = HexColor("#242333")
TEXT = HexColor("#525266")
MUTED = HexColor("#777789")
CREAM = HexColor("#F7F7FC")
WHITE = HexColor("#FFFFFF")
PURPLE = HexColor("#6C5CE7")
PURPLE_DARK = HexColor("#4E3FC0")
PURPLE_SOFT = HexColor("#ECE9FF")
LILAC = HexColor("#A79BFF")
TEAL = HexColor("#17BEBB")
TEAL_SOFT = HexColor("#DDF8F7")
YELLOW = HexColor("#FFC53D")
LINE = HexColor("#DDDDE8")

FONT_REGULAR_PATH = "/System/Library/Fonts/Supplemental/Trebuchet MS.ttf"
FONT_BOLD_PATH = "/System/Library/Fonts/Supplemental/Trebuchet MS Bold.ttf"
pdfmetrics.registerFont(TTFont("ImanRegular", FONT_REGULAR_PATH))
pdfmetrics.registerFont(TTFont("ImanBold", FONT_BOLD_PATH))


def split_lines(text: str, font: str, size: float, max_width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if pdfmetrics.stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def paragraph(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    size: float = 10,
    leading: float | None = None,
    color=TEXT,
    font: str = "ImanRegular",
    max_lines: int | None = None,
) -> float:
    leading = leading or size * 1.35
    lines = split_lines(text, font, size, width)
    if max_lines:
        lines = lines[:max_lines]
    c.setFont(font, size)
    c.setFillColor(color)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def round_rect(c, x, y, w, h, radius=14, fill=WHITE, stroke=None, line_width=1):
    c.setLineWidth(line_width)
    if fill is not None:
        c.setFillColor(fill)
    if stroke is not None:
        c.setStrokeColor(stroke)
    c.roundRect(x, y, w, h, radius, fill=1 if fill is not None else 0, stroke=1 if stroke else 0)


def pill(c, text, x, y, fill=PURPLE_SOFT, color=PURPLE_DARK, border=PURPLE, pad_x=9, h=20):
    c.setFont("ImanBold", 7.5)
    w = pdfmetrics.stringWidth(text, "ImanBold", 7.5) + pad_x * 2
    round_rect(c, x, y, w, h, h / 2, fill, border, 1)
    c.setFillColor(color)
    c.drawCentredString(x + w / 2, y + 6.1, text)
    return w


def magnet(c, x, y, scale=1.0, dark=False):
    """Logo Imán vectorial inspirado en el isotipo de la landing."""
    r = 18 * scale
    outer = WHITE if dark else INK
    c.setLineCap(1)

    def arc(stroke, width):
        p = c.beginPath()
        p.moveTo(x - r, y)
        p.lineTo(x - r, y + r * 1.05)
        p.curveTo(x - r, y + r * 2.35, x + r, y + r * 2.35, x + r, y + r * 1.05)
        p.lineTo(x + r, y)
        c.setStrokeColor(stroke)
        c.setLineWidth(width * scale)
        c.drawPath(p, stroke=1, fill=0)

    arc(outer, 12)
    arc(LILAC if dark else PURPLE, 7)
    pole_y = y - 4 * scale
    for px in (x - r, x + r):
        c.setFillColor(INK if dark else WHITE)
        c.setStrokeColor(outer)
        c.setLineWidth(1.7 * scale)
        c.roundRect(px - 7 * scale, pole_y, 14 * scale, 9 * scale, 2 * scale, fill=1, stroke=1)


def brand(c, x=42, y=H - 46, dark=False, compact=False):
    magnet(c, x + 14, y - 7, .53 if compact else .62, dark=dark)
    c.setFont("ImanBold", 16 if compact else 18)
    c.setFillColor(WHITE if dark else INK)
    c.drawString(x + 35, y, "Imán")
    c.setFont("ImanBold", 7)
    c.setFillColor(LILAC if dark else PURPLE)
    c.drawString(x + 73, y + 1, "CLUB")


def page_footer(c, page: int, label: str, dark=False):
    color = HexColor("#CBC8DA") if dark else MUTED
    c.setStrokeColor(HexColor("#4A485D") if dark else LINE)
    c.setLineWidth(.7)
    c.line(42, 34, W - 42, 34)
    c.setFont("ImanBold", 7.5)
    c.setFillColor(color)
    c.drawString(42, 20, label.upper())
    c.drawRightString(W - 42, 20, f"{page:02d} / 02")


def section_label(c, text, x, y, dark=False):
    c.setFont("ImanBold", 8)
    c.setFillColor(LILAC if dark else PURPLE)
    c.drawString(x, y, text.upper())
    c.setStrokeColor(LILAC if dark else PURPLE)
    c.setLineWidth(2)
    c.line(x, y - 6, x + 28, y - 6)


def title(c, text: str, x: float, y: float, width: float, size=26, color=INK, leading=None):
    leading = leading or size * 1.06
    c.setFont("ImanBold", size)
    c.setFillColor(color)
    for line in split_lines(text, "ImanBold", size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_icon(c, kind: str, cx: float, cy: float, color=PURPLE):
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(1.8)
    if kind == "data":
        c.ellipse(cx - 9, cy + 3, cx + 9, cy + 9, fill=0, stroke=1)
        c.line(cx - 9, cy + 6, cx - 9, cy - 7)
        c.line(cx + 9, cy + 6, cx + 9, cy - 7)
        c.arc(cx - 9, cy - 10, cx + 9, cy - 4, 180, 180)
        c.arc(cx - 9, cy - 3, cx + 9, cy + 3, 180, 180)
    elif kind == "mail":
        c.roundRect(cx - 10, cy - 7, 20, 14, 2, fill=0, stroke=1)
        c.line(cx - 9, cy + 5, cx, cy - 1)
        c.line(cx, cy - 1, cx + 9, cy + 5)
    elif kind == "club":
        c.circle(cx, cy + 5, 4, fill=0, stroke=1)
        c.arc(cx - 10, cy - 11, cx + 10, cy + 5, 20, 140)
        c.circle(cx - 9, cy + 1, 3, fill=0, stroke=1)
        c.circle(cx + 9, cy + 1, 3, fill=0, stroke=1)
    elif kind == "chart":
        c.line(cx - 10, cy - 9, cx - 10, cy + 9)
        c.line(cx - 10, cy - 9, cx + 11, cy - 9)
        c.setLineWidth(3)
        c.line(cx - 5, cy - 6, cx - 5, cy - 1)
        c.line(cx + 1, cy - 6, cx + 1, cy + 3)
        c.line(cx + 7, cy - 6, cx + 7, cy + 7)
    elif kind == "catalog":
        c.roundRect(cx - 10, cy - 10, 20, 20, 3, fill=0, stroke=1)
        c.line(cx - 4, cy - 10, cx - 4, cy + 10)
        c.line(cx + 2, cy - 2, cx + 7, cy - 2)
        c.line(cx + 2, cy + 4, cx + 7, cy + 4)
    elif kind == "store":
        c.rect(cx - 9, cy - 7, 18, 12, fill=0, stroke=1)
        c.line(cx - 11, cy + 5, cx + 11, cy + 5)
        c.line(cx - 8, cy + 10, cx + 8, cy + 10)
        c.line(cx - 11, cy + 5, cx - 8, cy + 10)
        c.line(cx + 11, cy + 5, cx + 8, cy + 10)
    elif kind == "delivery":
        c.rect(cx - 11, cy - 4, 14, 9, fill=0, stroke=1)
        c.rect(cx + 3, cy - 2, 7, 7, fill=0, stroke=1)
        c.circle(cx - 6, cy - 6, 2.5, fill=0, stroke=1)
        c.circle(cx + 7, cy - 6, 2.5, fill=0, stroke=1)
    elif kind == "loop":
        c.arc(cx - 10, cy - 10, cx + 10, cy + 10, 30, 235)
        p = c.beginPath()
        p.moveTo(cx + 9, cy + 4)
        p.lineTo(cx + 10, cy - 2)
        p.lineTo(cx + 4, cy)
        p.close()
        c.drawPath(p, fill=1, stroke=0)


def feature_card(c, x, y, w, h, number, icon, heading, body, accent=PURPLE):
    round_rect(c, x, y, w, h, 16, WHITE, LINE, .8)
    c.setFillColor(accent)
    c.circle(x + 28, y + h - 28, 17, fill=1, stroke=0)
    draw_icon(c, icon, x + 28, y + h - 28, WHITE)
    c.setFont("ImanBold", 7)
    c.setFillColor(accent)
    c.drawRightString(x + w - 15, y + h - 19, f"0{number}")
    c.setFont("ImanBold", 13)
    c.setFillColor(INK)
    c.drawString(x + 15, y + h - 59, heading)
    paragraph(c, body, x + 15, y + h - 77, w - 30, 8.6, 12, TEXT)


def page_one(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Formas magnéticas y textura editorial.
    c.setFillColor(PURPLE_SOFT)
    c.circle(W - 18, H - 25, 122, fill=1, stroke=0)
    c.setFillColor(TEAL_SOFT)
    c.circle(W - 80, 110, 82, fill=1, stroke=0)
    c.setStrokeColor(HexColor("#D7D1FF"))
    c.setLineWidth(1)
    for radius in (52, 78, 104):
        c.circle(W - 76, H - 178, radius, fill=0, stroke=1)

    brand(c, 42, H - 49)
    pill(c, "BRIEF COMERCIAL · 2026", W - 183, H - 61)

    c.setFont("ImanBold", 36)
    c.setFillColor(INK)
    c.drawString(42, H - 156, "Aumentá tus ventas")
    c.setFillColor(PURPLE)
    c.drawString(42, H - 199, "sin invertir")
    c.setFillColor(INK)
    c.drawString(42, H - 242, "en publicidad.")

    paragraph(
        c,
        "Imán convierte las compras que tu negocio ya genera en datos, relaciones y nuevas oportunidades de venta.",
        44,
        H - 286,
        345,
        13,
        18,
        TEXT,
        "ImanRegular",
    )

    # Ilustración del ciclo de recompra.
    cx, cy = W - 105, H - 211
    c.setFillColor(WHITE)
    c.setStrokeColor(INK)
    c.setLineWidth(1.5)
    c.circle(cx, cy, 51, fill=1, stroke=1)
    magnet(c, cx, cy - 15, .8)
    node_data = [
        (cx - 66, cy + 63, "COMPRA", PURPLE),
        (cx + 61, cy + 56, "DATOS", TEAL),
        (cx + 73, cy - 55, "MENSAJE", YELLOW),
        (cx - 66, cy - 66, "VUELVE", PURPLE_DARK),
    ]
    for nx, ny, text_value, fill in node_data:
        c.setFillColor(fill)
        c.circle(nx, ny, 23, fill=1, stroke=0)
        c.setFont("ImanBold", 5.8)
        c.setFillColor(WHITE if fill != YELLOW else INK)
        c.drawCentredString(nx, ny - 2, text_value)

    # Propuesta en tres bloques.
    cards = [
        ("01", "Bajá el costo por compra", "Reactivá clientes que ya tenés en vez de pagar siempre por alcance nuevo."),
        ("02", "Generá recompra", "Usá email personalizado según el historial y el momento de cada cliente."),
        ("03", "Unificá ventas y datos", "Catálogo y pedidos en el local o con envío, conectados al mismo cliente."),
    ]
    card_y = 130
    gap = 10
    card_w = (W - 84 - gap * 2) / 3
    for i, (num, heading, body) in enumerate(cards):
        x = 42 + i * (card_w + gap)
        round_rect(c, x, card_y, card_w, 132, 15, WHITE, INK, 1.1)
        c.setFont("ImanBold", 7.5)
        c.setFillColor(PURPLE)
        c.drawString(x + 13, card_y + 107, num)
        c.setFont("ImanBold", 11.5)
        c.setFillColor(INK)
        c.drawString(x + 13, card_y + 84, heading)
        paragraph(c, body, x + 13, card_y + 62, card_w - 26, 8.4, 11.8, TEXT)

    c.setFont("ImanBold", 10)
    c.setFillColor(INK)
    c.drawString(42, 87, "Tu marca. Tus clientes. Tu crecimiento.")
    c.setFont("ImanRegular", 8)
    c.setFillColor(MUTED)
    c.drawRightString(W - 42, 87, "Visión comercial · alcance configurable por negocio")
    page_footer(c, 1, "Imán · Brief comercial")
    c.showPage()


def page_two(c):
    c.setFillColor(INK)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(PURPLE_DARK)
    c.circle(W + 12, H - 22, 135, fill=1, stroke=0)
    c.setFillColor(HexColor("#303044"))
    c.circle(-30, 120, 105, fill=1, stroke=0)
    brand(c, 42, H - 44, dark=True, compact=True)
    section_label(c, "Impacto comercial", 42, H - 92, dark=True)
    y = title(c, "Mové los indicadores que importan.", 42, H - 126, 450, 28, WHITE)
    paragraph(
        c,
        "Imán trabaja sobre los clientes y las ventas que el negocio ya genera para producir más valor con cada relación.",
        42,
        y - 8,
        465,
        10.5,
        14.5,
        HexColor("#DAD8E6"),
    )

    # KPIs sin porcentajes inventados: dirección de impacto y mecanismo.
    kpis = [
        ("down", "Costo por compra", "Reactivás una audiencia propia y reducís la necesidad de pagar por cada nueva venta."),
        ("up", "Tasa de recompra", "Contactás al cliente en función de lo que compró y de cuándo suele volver."),
        ("up", "Valor por cliente", "Más frecuencia y más oportunidades relevantes a lo largo de la relación."),
        ("up", "Base propia", "Cada compra suma información accionable que queda en el negocio."),
    ]
    card_w = 245
    card_h = 112
    for i, (direction, heading, body) in enumerate(kpis):
        x = 42 + (i % 2) * 265
        y_card = 475 - (i // 2) * 128
        round_rect(c, x, y_card, card_w, card_h, 15, WHITE, None)
        c.setFillColor(PURPLE if i in (0, 2) else TEAL)
        c.circle(x + 26, y_card + card_h - 27, 15, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setStrokeColor(WHITE)
        c.setLineWidth(2)
        icon_x = x + 26
        icon_y = y_card + card_h - 27
        if direction == "down":
            c.line(icon_x, icon_y + 6, icon_x, icon_y - 5)
            c.line(icon_x, icon_y - 5, icon_x - 4, icon_y - 1)
            c.line(icon_x, icon_y - 5, icon_x + 4, icon_y - 1)
        else:
            c.line(icon_x, icon_y - 6, icon_x, icon_y + 5)
            c.line(icon_x, icon_y + 5, icon_x - 4, icon_y + 1)
            c.line(icon_x, icon_y + 5, icon_x + 4, icon_y + 1)
        c.setFont("ImanBold", 12)
        c.setFillColor(INK)
        c.drawString(x + 50, y_card + card_h - 31, heading)
        paragraph(c, body, x + 15, y_card + 51, card_w - 30, 8.1, 10.7, TEXT)

    c.setFont("ImanBold", 8)
    c.setFillColor(LILAC)
    c.drawString(42, 315, "CÓMO LO HACEMOS")
    flow_y = 263
    nodes = [
        ("1", "Captamos", "Datos específicos"),
        ("2", "Registramos", "Cliente + compra"),
        ("3", "Segmentamos", "Hábitos y frecuencia"),
        ("4", "Activamos", "Email personalizado"),
        ("5", "Recompran", "Nueva venta"),
    ]
    start_x = 67
    step = 105
    c.setStrokeColor(HexColor("#CFC8FF"))
    c.setLineWidth(3)
    c.line(start_x, flow_y, start_x + step * 4, flow_y)
    for i, (num, heading, body) in enumerate(nodes):
        x = start_x + i * step
        c.setFillColor(PURPLE if i in (0, 3, 4) else TEAL)
        c.circle(x, flow_y, 18, fill=1, stroke=0)
        c.setFont("ImanBold", 8)
        c.setFillColor(WHITE)
        c.drawCentredString(x, flow_y - 3, num)
        c.setFont("ImanBold", 9.5)
        c.setFillColor(WHITE)
        c.drawCentredString(x, flow_y - 42, heading)
        lines = split_lines(body, "ImanRegular", 7.2, 83)
        c.setFont("ImanRegular", 7.2)
        c.setFillColor(HexColor("#BDBACB"))
        for j, line in enumerate(lines[:2]):
            c.drawCentredString(x, flow_y - 57 - j * 9, line)

    round_rect(c, 42, 86, W - 84, 103, 16, PURPLE, None)
    c.setFillColor(WHITE)
    c.circle(75, 137, 17, fill=1, stroke=0)
    draw_icon(c, "catalog", 75, 137, PURPLE)
    c.setFont("ImanBold", 14)
    c.setFillColor(WHITE)
    c.drawString(104, 153, "El catálogo es el centro de la experiencia")
    paragraph(
        c,
        "Pedidos en el local o desde afuera, con retiro o envío. Cada operación se vincula al historial del cliente para alimentar la próxima acción comercial.",
        104,
        132,
        W - 165,
        8.8,
        11.5,
        HexColor("#F0EFFF"),
    )
    c.setFont("ImanBold", 8.5)
    c.setFillColor(WHITE)
    c.drawString(104, 101, "iman.ar")
    c.drawRightString(W - 59, 101, "+54 9 353 518-9997")
    page_footer(c, 2, "Imán · Impacto comercial", dark=True)
    c.showPage()


def page_three(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    brand(c, 42, H - 44, compact=True)
    section_label(c, "Herramientas principales", 42, H - 92)
    y = title(c, "Un sistema pensado alrededor de cada negocio.", 42, H - 126, 440, 28)
    paragraph(
        c,
        "La propuesta se configura con la identidad, la operación y el ciclo de compra de cada comercio.",
        42,
        y - 7,
        455,
        10.5,
        14,
        TEXT,
    )

    card_w = 245
    card_h = 183
    feature_card(
        c,
        42,
        405,
        card_w,
        card_h,
        1,
        "data",
        "Captación y registro de datos",
        "Define qué información importa para el negocio y la vincula con compras reales: contacto, frecuencia, preferencias, canal y comportamiento.",
        PURPLE,
    )
    feature_card(
        c,
        307,
        405,
        card_w,
        card_h,
        2,
        "mail",
        "Email marketing personalizado",
        "Campañas y mensajes adaptados al rubro, al momento del cliente y a lo que compró. Más relevancia; menos comunicación genérica.",
        TEAL,
    )
    feature_card(
        c,
        42,
        201,
        card_w,
        card_h,
        3,
        "club",
        "Club con identidad propia",
        "QR, registro sin app, puntos, beneficios y referidos con la marca del comercio. El cliente entra al negocio, no a un marketplace.",
        PURPLE_DARK,
    )
    feature_card(
        c,
        307,
        201,
        card_w,
        card_h,
        4,
        "chart",
        "Historial y lectura del negocio",
        "Un panel para ver clientes, compras, visitas, canjes y actividad. La información ayuda a decidir qué activar y a quién contactar.",
        TEAL,
    )

    round_rect(c, 42, 86, W - 84, 87, 16, INK, None)
    c.setFont("ImanBold", 8)
    c.setFillColor(LILAC)
    c.drawString(58, 144, "PRINCIPIO DE PRODUCTO")
    c.setFont("ImanBold", 14)
    c.setFillColor(WHITE)
    c.drawString(58, 120, "Pedir sólo los datos que sirven y explicar para qué se usan.")
    paragraph(
        c,
        "El consentimiento y la gestión responsable de la información forman parte de la experiencia desde el registro.",
        58,
        101,
        W - 116,
        8.4,
        11,
        HexColor("#DAD8E6"),
    )
    page_footer(c, 3, "Imán · Herramientas", dark=False)
    c.showPage()


def page_four(c):
    c.setFillColor(INK)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(PURPLE_DARK)
    c.circle(W + 15, H - 15, 145, fill=1, stroke=0)
    c.setFillColor(HexColor("#303044"))
    c.circle(-25, 120, 105, fill=1, stroke=0)
    brand(c, 42, H - 44, dark=True, compact=True)
    section_label(c, "La visión ideal", 42, H - 92, dark=True)
    y = title(c, "El catálogo como centro de la relación.", 42, H - 126, 440, 28, WHITE)
    paragraph(
        c,
        "Una experiencia única para mostrar la oferta, recibir pedidos y registrar la historia de cada cliente, sin importar dónde se concrete la compra.",
        42,
        y - 7,
        458,
        10.5,
        14.5,
        HexColor("#DAD8E6"),
    )

    # Tres canales, una sola base.
    channel_y = 480
    channels = [
        ("catalog", "Catálogo propio", "Productos, precios y beneficios con la identidad del negocio."),
        ("store", "Pedido en el local", "El cliente elige o escanea; la compra queda registrada."),
        ("delivery", "Pedido desde afuera", "Retiro o envío, conectado con el mismo perfil de cliente."),
    ]
    card_w = 158
    for i, (icon, heading, body) in enumerate(channels):
        x = 42 + i * (card_w + 17)
        round_rect(c, x, channel_y, card_w, 145, 16, WHITE, None)
        c.setFillColor(PURPLE_SOFT if i != 1 else TEAL_SOFT)
        c.circle(x + 28, channel_y + 112, 18, fill=1, stroke=0)
        draw_icon(c, icon, x + 28, channel_y + 112, PURPLE if i != 1 else TEAL)
        c.setFont("ImanBold", 11)
        c.setFillColor(INK)
        c.drawString(x + 14, channel_y + 78, heading)
        paragraph(c, body, x + 14, channel_y + 59, card_w - 28, 7.9, 10.5, TEXT)

    c.setFont("ImanBold", 8)
    c.setFillColor(LILAC)
    c.drawString(42, 446, "UNA COMPRA, CUATRO SEÑALES ÚTILES")
    table_y = 414
    columns = [
        ("QUIÉN", "Perfil y contacto", 42, 116),
        ("QUÉ", "Productos elegidos", 166, 116),
        ("CUÁNDO Y CÓMO", "Momento y canal", 290, 125),
        ("QUÉ HACER", "Próxima acción", 423, 129),
    ]
    for label, value, x, width in columns:
        c.setStrokeColor(HexColor("#535166"))
        c.setLineWidth(.8)
        c.line(x, table_y - 56, x + width - 8, table_y - 56)
        c.setFont("ImanBold", 7)
        c.setFillColor(LILAC)
        c.drawString(x, table_y, label)
        paragraph(c, value, x, table_y - 19, width - 10, 9, 11, WHITE)

    # Ruta de activación.
    c.setFont("ImanBold", 8)
    c.setFillColor(LILAC)
    c.drawString(42, 323, "HOJA DE RUTA PROPUESTA")
    phases = [
        ("1", "Base", "Club, QR, datos y reglas de fidelización."),
        ("2", "Venta", "Catálogo, pedidos, retiro y envío."),
        ("3", "Activación", "Email personalizado y recompra."),
    ]
    phase_w = 158
    for i, (num, heading, body) in enumerate(phases):
        x = 42 + i * (phase_w + 17)
        c.setFillColor(PURPLE if i != 1 else TEAL)
        c.circle(x + 12, 286, 11, fill=1, stroke=0)
        c.setFont("ImanBold", 7)
        c.setFillColor(WHITE)
        c.drawCentredString(x + 12, 283.5, num)
        c.setFont("ImanBold", 11)
        c.drawString(x + 31, 282, heading)
        paragraph(c, body, x, 258, phase_w, 8.1, 11, HexColor("#DAD8E6"))

    round_rect(c, 42, 88, W - 84, 115, 18, PURPLE, None)
    c.setFont("ImanBold", 21)
    c.setFillColor(WHITE)
    c.drawString(59, 164, "Convertí cada compra en la próxima.")
    paragraph(
        c,
        "Diseñemos Imán alrededor de tu negocio, tus productos y la forma real en que compran tus clientes.",
        59,
        137,
        365,
        9.3,
        12.5,
        HexColor("#F0EFFF"),
    )
    c.setFont("ImanBold", 9)
    c.setFillColor(WHITE)
    c.drawString(59, 105, "iman.ar")
    c.drawRightString(W - 59, 105, "+54 9 353 518-9997")
    page_footer(c, 4, "Imán · Visión de producto", dark=True)
    c.showPage()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("Brief comercial Imán")
    c.setAuthor("Imán")
    c.setSubject("Propuesta comercial: aumentar ventas sin invertir en publicidad")
    c.setCreator("Imán")
    for page in (page_one, page_two):
        page(c)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build()
