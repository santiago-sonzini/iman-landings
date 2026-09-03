from pathlib import Path
from urllib.parse import quote

from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path('/Users/santiagosonzini/Desktop/landings/urbase')
OUT = ROOT / 'output/pdf/HABIL_catalogo_mayorista.pdf'
BOARD = ROOT / 'output/branding/habil/variaciones_color/02_verde_petroleo.png'
DL = Path('/Users/santiagosonzini/Downloads')
CLIP = Path('/var/folders/3p/qr2wg8bs2zjdkfmpt92z6r7r0000gn/T')
HERO = DL / 'WhatsApp Image 2026-07-15 at 11.28.05 (1).jpeg'
CLASSIC = DL / 'WhatsApp Image 2026-07-15 at 11.28.05.jpeg'
CUSTOM = DL / 'WhatsApp Image 2026-07-15 at 11.28.04 (1).jpeg'
WHITE = DL / 'WhatsApp Image 2026-07-15 at 11.28.04.jpeg'
PHONE1 = CLIP / 'codex-clipboard-3543ee0d-e228-4c97-8674-6ed86016ad66.png'
PHONE2 = CLIP / 'codex-clipboard-db0f0c9d-3870-484d-ab89-bcf5712c557c.png'
DUST = CLIP / 'codex-clipboard-bb1abfb2-4586-4f48-a984-e1dee5943250.png'
RAZOR = CLIP / 'codex-clipboard-283585ea-cb40-4dea-8bef-885df22f03be.png'
BAG = CLIP / 'codex-clipboard-f8dc6ee3-ffae-4c61-8b55-fed63893968a.png'

W, H = A4
M = 38
CW = W - M * 2
TEAL = HexColor('#178A7D')
DEEP = HexColor('#145F57')
INK = HexColor('#202423')
PAPER = HexColor('#F5F1E8')
SOFT = HexColor('#E8F1ED')
MUTED = HexColor('#63736D')
LINE = HexColor('#D8E0DB')

WEB = 'https://urbase.store'
WA = 'https://wa.me/5493534419023?text=' + quote('Hola, quiero hacer una consulta sobre el catálogo mayorista HÁBIL.')

pdfmetrics.registerFont(TTFont('Body', '/Library/Fonts/Artifakt Element Regular.ttf'))
pdfmetrics.registerFont(TTFont('Bold', '/Library/Fonts/Artifakt Element Bold.ttf'))
pdfmetrics.registerFont(TTFont('Display', '/System/Library/Fonts/Supplemental/Arial Black.ttf'))


def rect(c, x, top, width, height, color, radius=0, stroke=None):
    c.setFillColor(color)
    c.setStrokeColor(stroke or color)
    c.setLineWidth(0.65)
    if radius:
        c.roundRect(x, H-top-height, width, height, radius, fill=1, stroke=bool(stroke))
    else:
        c.rect(x, H-top-height, width, height, fill=1, stroke=bool(stroke))


def text(c, value, x, top, size=10, font='Body', color=INK, align='left'):
    y = H - top - size
    width = pdfmetrics.stringWidth(value, font, size)
    if align == 'right':
        x -= width
    elif align == 'center':
        x -= width / 2
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setFillColor(color)
    t.setCharSpace(0)
    t.textLine(value)
    c.drawText(t)


def kicker(c, value, x, top, color=MUTED, size=8, tracking=1.1):
    c.saveState()
    t = c.beginText(x, H-top-size)
    t.setFont('Bold', size)
    t.setCharSpace(tracking)
    t.setFillColor(color)
    t.textLine(value)
    c.drawText(t)
    c.restoreState()


def paragraph(c, value, x, top, width, size=10, leading=14, font='Body', color=INK):
    lines = []
    for para in value.split('\n'):
        line = ''
        for word in para.split():
            test = (line + ' ' + word).strip()
            if pdfmetrics.stringWidth(test, font, size) <= width:
                line = test
            else:
                if line:
                    lines.append(line)
                line = word
        lines.append(line)
    for i, line in enumerate(lines):
        text(c, line, x, top+i*leading, size, font, color)
    return top + len(lines)*leading


def rule(c, x, top, width, color=LINE):
    c.setStrokeColor(color)
    c.setLineWidth(0.65)
    c.line(x, H-top, x+width, H-top)


def photo(c, path, x, top, width, height, radius=0, contain=False):
    with Image.open(path) as im:
        iw, ih = im.size
    s = min(width/iw, height/ih) if contain else max(width/iw, height/ih)
    dw, dh = iw*s, ih*s
    dx = x+(width-dw)/2
    dy = H-top-height+(height-dh)/2
    c.saveState()
    p = c.beginPath()
    if radius:
        p.roundRect(x, H-top-height, width, height, radius)
    else:
        p.rect(x, H-top-height, width, height)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(str(path), dx, dy, dw, dh, mask='auto')
    c.restoreState()


def crop_on_page(c, path, box, x, top, width):
    """Clip an unmodified source image in PDF layout; no edited raster is created."""
    left, upper, right, lower = box
    with Image.open(path) as im:
        iw, ih = im.size
    s = width / (right-left)
    height = (lower-upper)*s
    c.saveState()
    p = c.beginPath()
    p.rect(x, H-top-height, width, height)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(str(path), x-left*s, H-top+upper*s-ih*s, iw*s, ih*s, mask='auto')
    c.restoreState()
    return height


def brand(c, x, top, width):
    return crop_on_page(c, BOARD, (183, 86, 1355, 357), x, top, width)


def bracket(c, x, top, size, color=TEAL, rotate=False):
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(size*.20)
    c.setLineCap(1)
    c.setLineJoin(1)
    p = c.beginPath()
    if rotate:
        p.moveTo(x, H-top)
        p.lineTo(x+size, H-top)
        p.lineTo(x+size, H-top-size)
    else:
        p.moveTo(x, H-top-size)
        p.lineTo(x, H-top)
        p.lineTo(x+size, H-top)
    c.drawPath(p)
    c.restoreState()


def link(c, url, x, top, width, height):
    c.linkURL(url, (x, H-top-height, x+width, H-top), relative=0, thickness=0)


def footer(c, number):
    rule(c, M, 770, CW)
    text(c, 'HÁBIL / MAYORISTA', M, 784, 8, 'Bold', TEAL)
    text(c, '+54 9 353 441-9023', M, 802, 9, 'Bold')
    text(c, 'urbase.store', M+180, 802, 9)
    link(c, WA, M-2, 800, 155, 16)
    link(c, WEB, M+178, 800, 95, 16)
    text(c, f'{number:02d} / 04', W-M, 802, 8, 'Body', MUTED, 'right')
    text(c, 'Precios por unidad en pesos argentinos (ARS).', M+180, 785, 7.3, 'Body', MUTED)


def page_header(c, section, title, description):
    rect(c, 0, 0, W, H, PAPER)
    brand(c, M, 27, 219)
    kicker(c, section, 360, 47, TEAL, 8)
    rule(c, M, 95, CW)
    text(c, title, M, 114, 26, 'Display')
    paragraph(c, description, M, 154, CW, 10, 14, color=MUTED)


def cover(c):
    rect(c, 0, 0, W, H, PAPER)
    brand(c, M, 29, 441)
    kicker(c, 'SEPTIEMBRE 2026 / PRECIOS POR UNIDAD', M, 149, TEAL)
    text(c, 'CATÁLOGO', M, 176, 36, 'Display')
    text(c, 'MAYORISTA', M, 219, 36, 'Display')
    bracket(c, 506, 186, 37, TEAL, rotate=True)
    paragraph(c, 'Soportes para casco, celular y objetos útiles para todos los días.', M, 277, CW-10, 12, 17)

    photo(c, HERO, M, 327, 338, 347, 14)
    rect(c, 389, 327, W-M-389, 347, TEAL, 14)
    paragraph(c, 'Una marca.\nMuchas\nsoluciones.', 407, 354, 130, 20, 25, 'Bold', white)
    rule(c, 407, 459, 129, HexColor('#70B8AE'))
    kicker(c, '01 / CASCOS', 407, 481, white, 8)
    paragraph(c, 'Clásicos y\npersonalizados.', 407, 500, 126, 10, 14, color=white)
    kicker(c, '02 / CELULARES', 407, 547, white, 8)
    paragraph(c, 'Con y sin branding.', 407, 566, 126, 10, 14, color=white)
    kicker(c, '03 / OBJETOS', 407, 605, white, 8)
    paragraph(c, 'Hogar y taller.', 407, 624, 126, 10, 14, color=white)

    rect(c, M, 703, CW, 92, INK, 12)
    kicker(c, 'PEDIDOS Y CONSULTAS', 56, 720, HexColor('#A7D5C9'), 8)
    text(c, '+54 9 353 441-9023', 56, 741, 17, 'Bold', white)
    text(c, 'urbase.store', 56, 767, 10, 'Body', white)
    link(c, WA, 52, 738, 240, 24)
    link(c, WEB, 52, 765, 120, 18)
    paragraph(c, 'Elegí el producto,\nla versión y la cantidad.', 374, 735, 160, 10, 15, color=white)
    text(c, 'HÁBIL - Objetos que resuelven', M, 817, 7.5, 'Body', MUTED)
    text(c, '01 / 04', W-M, 817, 7.5, 'Body', MUTED, 'right')
    c.showPage()


def helmet_price(c, x, top, width, title, subtitle, first_price, bulk_price, note):
    rect(c, x, top, width, 230, white, 12, LINE)
    text(c, title, x+17, top+17, 16, 'Bold')
    text(c, subtitle, x+17, top+41, 9, 'Body', MUTED)
    rule(c, x+17, top+65, width-34)
    text(c, '1 A 4 UNIDADES', x+17, top+88, 8.3, 'Bold', MUTED)
    text(c, first_price, x+width-17, top+73, 25, 'Bold', INK, 'right')
    text(c, 'POR UNIDAD', x+width-17, top+103, 7.4, 'Body', MUTED, 'right')
    rect(c, x+12, top+126, width-24, 60, TEAL, 8)
    text(c, 'DESDE 5 UNIDADES', x+25, top+136, 8, 'Bold', white)
    text(c, bulk_price, x+width-25, top+149, 25, 'Bold', white, 'right')
    paragraph(c, note, x+17, top+198, width-34, 8.1, 11, color=MUTED)


def helmets(c):
    page_header(c, '01 / CASCOS', 'Soportes para casco', 'Versión clásica y personalizada. Elegí el diseño para tu pedido.')
    gap = 13
    tw = (CW-2*gap)/3
    items = [(CLASSIC, 'CLÁSICA / NEGRO'), (WHITE, 'CLÁSICA / BLANCO'), (CUSTOM, 'PERSONALIZADA')]
    for i, (path, label) in enumerate(items):
        x = M+i*(tw+gap)
        photo(c, path, x, 192, tw, 184, 10)
        kicker(c, label, x+2, 389, TEAL, 7.4, .45)

    pw = (CW-15)/2
    helmet_price(c, M, 426, pw, 'Versión clásica', 'Diseño de línea', '$12.000', '$10.500', 'Negro y blanco. Consultá\ncolores disponibles.')
    helmet_price(c, M+pw+15, 426, pw, 'Personalizada', 'Marca a elección', '$13.000', '$11.500', 'Se pueden combinar distintas marcas\no variaciones en un mismo pedido.')
    paragraph(c, 'El precio desde 5 unidades se aplica a partir de esa cantidad. Todos los valores son por unidad.', M, 681, CW, 9.2, 13, color=MUTED)
    paragraph(c, 'Fotos de referencia de los acabados y personalizaciones. Confirmar diseño y colores al realizar el pedido.', M, 725, CW, 8.2, 12, color=MUTED)
    footer(c, 2)
    c.showPage()


def phone_card(c, x, top, width, model, image, price):
    rect(c, x, top, width, 418, white, 12, LINE)
    kicker(c, model, x+18, top+20, TEAL, 9)
    rect(c, x+18, top+52, width-36, 113, SOFT, 8)
    photo(c, image, x+(width-114)/2, top+65, 114, 85.5, contain=True)
    text(c, 'Imagen de referencia', x+width/2, top+173, 7.2, 'Body', MUTED, 'center')
    text(c, 'Soporte para celular', x+18, top+195, 14, 'Bold')
    text(c, price, x+18, top+227, 33, 'Display')
    kicker(c, 'PRECIO POR UNIDAD', x+19, top+270, MUTED, 7.5, .6)
    rule(c, x+18, top+296, width-36)
    text(c, 'VERSIONES DISPONIBLES', x+18, top+310, 8, 'Bold', MUTED)
    rect(c, x+18, top+333, width-36, 27, SOFT, 5)
    text(c, 'SIN BRANDING', x+30, top+341, 8.3, 'Bold', INK)
    rect(c, x+18, top+368, width-36, 32, TEAL, 5)
    text(c, 'CON BRANDING', x+30, top+375, 8.3, 'Bold', white)
    text(c, 'Mínimo 30 unidades', x+width-28, top+387, 7.1, 'Body', white, 'right')


def phones(c):
    page_header(c, '02 / CELULARES', 'Soportes para celular', 'Dos modelos, cada uno en versión sin branding o con el logo de tu negocio.')
    pw = (CW-15)/2
    phone_card(c, M, 191, pw, 'MODELO 01', PHONE1, '$2.200')
    phone_card(c, M+pw+15, 191, pw, 'MODELO 02', PHONE2, '$1.500')
    rect(c, M, 636, CW, 88, TEAL, 11)
    text(c, 'Personalizá con tu marca.', M+19, 650, 19, 'Bold', white)
    paragraph(c, 'Pedidos de soportes para celular con branding: mínimo de 30 unidades.\nEnviá tu logo para consultar la personalización.', M+19, 680, CW-38, 9.4, 14, color=white)
    text(c, 'Colores y combinación de modelos: consultar al realizar el pedido.', M, 742, 8.2, 'Body', MUTED)
    footer(c, 3)
    c.showPage()


def other_card(c, top, image, title, desc):
    rect(c, M, top, CW, 122, white, 10, LINE)
    rect(c, M+13, top+15, 113, 92, SOFT, 6)
    photo(c, image, M+22, top+26, 95, 71.25, contain=True)
    text(c, title, M+147, top+20, 15.5, 'Bold')
    paragraph(c, desc, M+147, top+47, CW-165, 9, 12, color=MUTED)
    text(c, 'Precio: consultar', M+147, top+82, 12, 'Bold', TEAL)


def objects(c):
    page_header(c, '03 / OBJETOS ÚTILES', 'Más soluciones cotidianas', 'Productos para el hogar y el taller. Consultá precios y opciones disponibles.')
    other_card(c, 192, DUST, 'Recolector de polvo para taladro', 'Accesorio para tareas de perforación.')
    other_card(c, 327, RAZOR, 'Afeitadora clásica', 'Modelo de afeitadora de formato clásico.')
    other_card(c, 462, BAG, 'Cierre para bolsas', 'Accesorio para el cierre de bolsas.')
    rect(c, M, 612, CW, 123, INK, 11)
    text(c, 'Armá tu pedido.', M+19, 629, 21, 'Bold', white)
    paragraph(c, 'Indicá producto, cantidad y versión. Si querés personalización, adjuntá el logo o la marca elegida.', M+19, 664, CW-38, 10, 14, color=white)
    paragraph(c, 'Consultá colores, disponibilidad, tiempos de producción y opciones de envío.', M+19, 703, CW-38, 8.3, 12, color=HexColor('#B9CDC6'))
    text(c, 'Imágenes de referencia. Precio y personalización de estos productos a confirmar.', M, 748, 7.8, 'Body', MUTED)
    footer(c, 4)
    c.showPage()


def main():
    for path in [BOARD, HERO, CLASSIC, CUSTOM, WHITE, PHONE1, PHONE2, DUST, RAZOR, BAG]:
        if not path.is_file():
            raise FileNotFoundError(path)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle('HÁBIL | Catálogo mayorista')
    c.setAuthor('HÁBIL')
    c.setSubject('Soportes para casco y celular, objetos útiles y opciones de branding. Septiembre 2026.')
    c.setCreator('HÁBIL - Catálogo comercial')
    cover(c)
    helmets(c)
    phones(c)
    objects(c)
    c.save()
    print(OUT)


if __name__ == '__main__':
    main()
