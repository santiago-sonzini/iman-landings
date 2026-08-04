from pathlib import Path

from PIL import Image
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path("/Users/santiagosonzini/Desktop/landings/urbase")
OUT = ROOT / "output/pdf/URBASE_lista_mayorista.pdf"

IMG_HERO = Path("/Users/santiagosonzini/Downloads/WhatsApp Image 2026-07-15 at 11.28.05 (1).jpeg")
IMG_CLASSIC_BLACK = Path("/Users/santiagosonzini/Downloads/WhatsApp Image 2026-07-15 at 11.28.05.jpeg")
IMG_LOGO = Path("/Users/santiagosonzini/Downloads/WhatsApp Image 2026-07-15 at 11.29.38.jpeg")
IMG_CUSTOM = Path("/Users/santiagosonzini/Downloads/WhatsApp Image 2026-07-15 at 11.28.04 (1).jpeg")
IMG_CLASSIC_WHITE = Path("/Users/santiagosonzini/Downloads/WhatsApp Image 2026-07-15 at 11.28.04.jpeg")

W, H = A4
BLACK = HexColor("#0D0D0D")
INK = HexColor("#171717")
PAPER = HexColor("#F3F2EE")
WARM = HexColor("#B8B2A7")
MUTED = HexColor("#68645D")
LINE = HexColor("#D9D6CF")
SOFT = HexColor("#E9E7E1")

WEB_URL = "https://urbase.store"
WA_URL = "https://wa.me/5493534419023"


def cover_image(c, path, x, y, w, h, radius=0):
    """Draw an image cropped to completely cover the requested box."""
    with Image.open(path) as im:
        iw, ih = im.size
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    dx, dy = x + (w - dw) / 2, y + (h - dh) / 2

    c.saveState()
    clip = c.beginPath()
    if radius:
        clip.roundRect(x, y, w, h, radius)
    else:
        clip.rect(x, y, w, h)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(str(path), dx, dy, width=dw, height=dh, mask="auto")
    c.restoreState()


def spaced_text(c, text, x, y, size, color, spacing=1.2, font="Helvetica-Bold"):
    c.saveState()
    c.setFillColor(color)
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setCharSpace(spacing)
    t.textLine(text)
    c.drawText(t)
    c.restoreState()


def wrapped_text(c, text, x, y, max_width, font="Helvetica", size=10, leading=14, color=INK):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    c.setFillColor(color)
    c.setFont(font, size)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_logo(c, x, y, size):
    c.drawImage(str(IMG_LOGO), x, y, width=size, height=size, mask="auto")


def price_card(c, x, y, w, h, title, subtitle, regular, wholesale, custom=False):
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 14, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, 14, fill=0, stroke=1)

    spaced_text(c, title.upper(), x + 20, y + h - 34, 10, MUTED, spacing=1.5)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 17)
    c.drawString(x + 20, y + h - 62, subtitle)

    row_top = y + h - 92
    c.setStrokeColor(LINE)
    c.line(x + 20, row_top, x + w - 20, row_top)

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9)
    c.drawString(x + 20, row_top - 23, "1 A 4 UNIDADES")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 22)
    c.drawRightString(x + w - 20, row_top - 28, regular)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawRightString(x + w - 20, row_top - 41, "POR UNIDAD")

    highlight_y = y + 46
    c.setFillColor(BLACK)
    c.roundRect(x + 14, highlight_y, w - 28, 60, 10, fill=1, stroke=0)
    c.setFillColor(WARM)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 27, highlight_y + 42, "DESDE 5 UNIDADES")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 23)
    c.drawRightString(x + w - 27, highlight_y + 30, wholesale)
    c.setFont("Helvetica", 8)
    c.drawRightString(x + w - 27, highlight_y + 17, "POR UNIDAD")

    if custom:
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 7.8)
        c.drawString(x + 20, y + 34, "Se pueden combinar distintas marcas")
        c.drawString(x + 20, y + 23, "o variaciones dentro del mismo pedido.")
    else:
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8)
        c.drawString(x + 20, y + 28, "Diseño URBASE. Consultá colores disponibles.")


def add_link(c, url, x, y, w, h):
    c.linkURL(url, (x, y, x + w, y + h), relative=0, thickness=0)


def page_one(c):
    cover_image(c, IMG_HERO, 0, 0, W, H)

    c.saveState()
    c.setFillColor(BLACK)
    c.setFillAlpha(0.91)
    c.rect(0, 0, W * 0.56, H, fill=1, stroke=0)
    c.restoreState()

    c.saveState()
    c.setFillColor(BLACK)
    c.setFillAlpha(0.22)
    c.rect(W * 0.56, 0, W * 0.44, H, fill=1, stroke=0)
    c.restoreState()

    draw_logo(c, 38, H - 103, 58)
    spaced_text(c, "URBASE", 108, H - 72, 11, white, spacing=3.0)
    c.setFillColor(WARM)
    c.setFont("Helvetica", 8)
    c.drawString(108, H - 89, "SOPORTES PARA CASCOS")

    spaced_text(c, "LISTA", 38, H - 226, 38, white, spacing=0.6)
    spaced_text(c, "MAYORISTA", 38, H - 270, 38, white, spacing=0.6)

    c.setFillColor(WARM)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, H - 309, "PRECIOS POR UNIDAD - 2026")

    wrapped_text(
        c,
        "Soportes de pared para cascos, con versión clásica y opción personalizada para tu negocio.",
        40,
        H - 355,
        W * 0.42,
        font="Helvetica",
        size=12,
        leading=18,
        color=white,
    )

    c.setFillColor(Color(1, 1, 1, alpha=0.13))
    c.roundRect(38, 91, W * 0.46, 98, 12, fill=1, stroke=0)
    c.setFillColor(WARM)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(54, 164, "CONTACTO COMERCIAL")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(54, 139, "+54 9 353 441-9023")
    c.setFont("Helvetica", 11)
    c.drawString(54, 116, "urbase.store")
    add_link(c, WA_URL, 50, 132, 150, 20)
    add_link(c, WEB_URL, 50, 107, 105, 18)

    c.setFillColor(white)
    c.setFont("Helvetica", 7)
    c.drawRightString(W - 24, 22, "01 / 02")


def image_tile(c, path, x, y, w, h, label, detail):
    cover_image(c, path, x, y, w, h, radius=12)
    c.saveState()
    c.setFillColor(BLACK)
    c.setFillAlpha(0.82)
    c.roundRect(x, y, w, 38, 0, fill=1, stroke=0)
    c.restoreState()
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(x + 11, y + 22, label)
    c.setFillColor(WARM)
    c.setFont("Helvetica", 6.8)
    c.drawString(x + 11, y + 10, detail)


def page_two(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    c.setFillColor(BLACK)
    c.rect(0, H - 82, W, 82, fill=1, stroke=0)
    draw_logo(c, 32, H - 69, 42)
    spaced_text(c, "LISTA MAYORISTA", 86, H - 45, 15, white, spacing=1.5)
    c.setFillColor(WARM)
    c.setFont("Helvetica", 8)
    c.drawString(87, H - 62, "URBASE - PRECIOS POR UNIDAD")
    c.setFillColor(white)
    c.setFont("Helvetica", 7)
    c.drawRightString(W - 30, H - 45, "02 / 02")

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(36, H - 124, "Dos versiones. Una misma solución.")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9.5)
    c.drawString(37, H - 145, "Elegí el diseño URBASE o personalizalo con las marcas que comercializás.")

    gap = 11
    tile_w = (W - 72 - gap * 2) / 3
    tile_y, tile_h = 481, 185
    image_tile(c, IMG_CLASSIC_BLACK, 36, tile_y, tile_w, tile_h, "CLÁSICA - NEGRO", "Diseño URBASE")
    image_tile(c, IMG_CUSTOM, 36 + tile_w + gap, tile_y, tile_w, tile_h, "PERSONALIZADA", "Ejemplo con marca")
    image_tile(c, IMG_CLASSIC_WHITE, 36 + (tile_w + gap) * 2, tile_y, tile_w, tile_h, "CLÁSICA - BLANCO", "Diseño URBASE")

    card_y, card_h = 198, 250
    price_card(c, 36, card_y, 252, card_h, "Versión clásica", "Diseño URBASE", "$12.000", "$10.500")
    price_card(c, 307, card_y, 252, card_h, "Versión personalizada", "Marca a elección", "$13.000", "$11.500", custom=True)

    c.setFillColor(BLACK)
    c.rect(0, 0, W, 164, fill=1, stroke=0)
    c.setFillColor(WARM)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(36, 130, "PEDIDOS Y CONSULTAS")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(36, 103, "+54 9 353 441-9023")
    c.setFont("Helvetica", 12)
    c.drawString(36, 78, "urbase.store")
    add_link(c, WA_URL, 32, 96, 175, 23)
    add_link(c, WEB_URL, 32, 70, 110, 21)

    c.setFillColor(WARM)
    c.setFont("Helvetica", 7.5)
    c.drawRightString(W - 36, 130, "CONDICIONES")
    c.setFillColor(white)
    c.setFont("Helvetica", 8)
    c.drawRightString(W - 36, 108, "Precios expresados en pesos argentinos (ARS).")
    c.drawRightString(W - 36, 94, "Valores por unidad. Consultar disponibilidad,")
    c.drawRightString(W - 36, 80, "tiempos de producción y opciones de envío.")
    c.setFillColor(WARM)
    c.setFont("Helvetica", 7)
    c.drawRightString(W - 36, 38, "URBASE - GUARDÁ TU CASCO. COLGÁ TU EQUIPO.")


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle("URBASE - Lista mayorista 2026")
    c.setAuthor("URBASE")
    c.setSubject("Lista de precios mayoristas de soportes para cascos")
    c.setCreator("URBASE")

    page_one(c)
    c.showPage()
    page_two(c)
    c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    main()
