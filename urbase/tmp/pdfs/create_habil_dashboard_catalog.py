import json
from pathlib import Path
from urllib.parse import quote

from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab import rl_config

from create_habil_catalog import (
    ROOT, W, H, M, CW, TEAL, DEEP, INK, PAPER, SOFT, MUTED, LINE,
    rect, text, kicker, paragraph, rule, photo, brand, bracket, link, helmet_price,
)

DATA = json.loads((ROOT / 'output/pdf/habil-dashboard.json').read_text())
PRODUCTS = {p['slug']: p for p in DATA['products']}
IMAGE_DIR = ROOT / 'output/pdf/habil-originales'
MANIFEST = json.loads((IMAGE_DIR / 'manifest.json').read_text())
IMAGES = {(item['slug'], item['index']): IMAGE_DIR / item['filename'] for item in MANIFEST}
OUT = ROOT / 'output/pdf/HABIL_catalogo_mayorista.pdf'
WA = 'https://wa.me/5493535189997?text=' + quote('Hola, quiero consultar el catálogo mayorista HÁBIL.')
TOTAL = 4
rl_config.useA85 = 0
DATE = '03/09/2026'


def ars(value):
    whole, cents = f'{value:,.2f}'.split('.')
    return '$' + whole.replace(',', '.') + (',' + cents if cents != '00' else '')


def footer(c, number):
    rule(c, M, 776, CW)
    text(c, 'HÁBIL / MAYORISTA', M, 787, 8, 'Bold', TEAL)
    text(c, '353 518-9997', M, 806, 10, 'Bold')
    link(c, WA, M, 803, 140, 18)
    text(c, f'Valores por unidad en ARS · {DATE}', M+178, 789, 8, 'Body', MUTED)
    text(c, 'Pedidos y consultas por WhatsApp', M+178, 806, 9, 'Body', MUTED)
    text(c, f'{number:02d} / {TOTAL:02d}', W-M, 806, 8, 'Body', MUTED, 'right')


def header(c, section, title, description):
    rect(c, 0, 0, W, H, PAPER)
    brand(c, M, 28, 220)
    kicker(c, section, W-M, 48, TEAL, 8, .3)
    rule(c, M, 94, CW)
    text(c, title, M, 114, 26, 'Display')
    paragraph(c, description, M, 155, CW, 9.5, 13, color=MUTED)


def cover(c):
    rect(c, 0, 0, W, H, PAPER)
    brand(c, M, 30, 463)
    kicker(c, 'INGENIO INDUSTRIAL / SEPTIEMBRE 2026', M, 161, TEAL)
    text(c, 'CATÁLOGO', M, 190, 37, 'Display')
    text(c, 'MAYORISTA', M, 233, 37, 'Display')
    bracket(c, 513, 201, 30, TEAL, True)
    paragraph(c, 'Una marca. Muchas soluciones.\nSoportes y objetos útiles para todos los días.', M, 293, CW, 12, 17)
    photo(c, IMAGES[('colgador-de-casco-de-moto', 0)], M, 357, CW, 420, 13, contain=True)
    text(c, 'HÁBIL · Objetos que resuelven', M, 816, 8, 'Body', MUTED)
    text(c, '01 / 04', W-M, 816, 8, 'Body', MUTED, 'right')
    c.showPage()


def helmets(c):
    p = PRODUCTS['colgador-de-casco-de-moto']
    header(c, '', 'Tu casco, en su lugar.', 'Colgador de pared para casco de moto. Clásicos y variantes de marca en una misma línea.')
    labels = ['NEGRO / CLÁSICO', 'BLANCO / CLÁSICO', 'NEGRO / HONDA']
    width = (CW-22)/3
    for i in range(3):
        x = M+i*(width+11)
        photo(c, IMAGES[(p['slug'], i)], x, 193, width, width, 8, contain=True)
        kicker(c, labels[i], x, 370, TEAL, 7.5, .25)
    width = (CW-15)/2
    helmet_price(c, M, 423, width, 'Versión clásica', 'Diseño de línea', '$12.000', '$10.500', 'Negro y blanco. Consultá\ncolores disponibles.')
    helmet_price(c, M+width+15, 423, width, 'Personalizada', 'Marca a elección', '$13.000', '$11.500', 'Se pueden combinar distintas marcas\no variaciones en un mismo pedido.')
    paragraph(c, 'Podés combinar variaciones de marcas en tu pedido. Para otros logos o diseños, consultá personalización y condiciones.', M, 714, CW, 10, 14, color=MUTED)
    footer(c, 2)
    c.showPage()


def four_card(c, p, x, top, width):
    rect(c, x, top, width, 267, white, 10, LINE)
    photo(c, IMAGES[(p['slug'], 0)], x+9, top+9, width-18, 151, 6, contain=True)
    name = p['name'].replace('Soporte chico para celular 13 mm (marca Sanigas)', 'Soporte de celular 13 mm · marca Sanigas')
    paragraph(c, name, x+13, top+170, width-26, 11, 14, 'Bold')
    text(c, ars(p['wholesalePrice']), x+13, top+216, 23, 'Bold', TEAL)
    text(c, 'MAYORISTA / UNIDAD', x+13, top+247, 7, 'Bold', MUTED)
    link(c, WA, x, top, width, 267)


def phones(c):
    header(c, '', 'Celulares con su lugar.', 'Versiones sin branding y con tu marca. Personalizados: mínimo de 30 unidades.')
    slugs = ['soporte-chico-para-celular', 'soporte-de-celular-para-exterior']
    width = (CW-14)/2
    for i, slug in enumerate(slugs):
        p = PRODUCTS[slug]
        x = M+i*(width+14)
        rect(c, x, 194, width, 405, white, 10, LINE)
        photo(c, IMAGES[(slug, 0)], x+11, 208, width-22, width-22, 7, contain=True)
        paragraph(c, p['name'], x+15, 451, width-30, 13, 17, 'Bold')
        text(c, ars(rounded(p['wholesalePrice'])), x+15, 503, 32, 'Bold', TEAL)
        text(c, 'MAYORISTA / UNIDAD', x+15, 545, 8, 'Bold', MUTED)
        text(c, 'Sin branding / Con branding', x+15, 574, 9, 'Bold')
    rect(c, M, 625, CW, 111, TEAL, 11)
    text(c, 'Personalizá con tu marca.', M+18, 643, 21, 'Bold', white)
    paragraph(c, 'Con branding: mínimo de 30 unidades. Enviá tu logo para confirmar diseño y cotización de la personalización.', M+18, 682, CW-36, 10, 15, color=white)
    text(c, 'Valores de referencia del modelo base. Colores y personalización a confirmar.', M, 754, 8, 'Body', MUTED)
    footer(c, 3)
    c.showPage()


def row_card(c, p, top, note=''):
    rect(c, M, top, CW, 176, white, 10, LINE)
    photo(c, IMAGES[(p['slug'], 0)], M+10, top+10, 170, 156, 5, contain=True)
    x = M+195
    width = CW-211
    title_end = paragraph(c, p['name'], x, top+19, width, 15, 19, 'Bold')
    if note:
        paragraph(c, note, x, title_end+7, width, 9, 12, color=MUTED)
    text(c, ars(rounded(p['wholesalePrice'])), x, top+111, 27, 'Bold', TEAL)
    text(c, 'MAYORISTA POR UNIDAD', x, top+148, 7.5, 'Bold', MUTED)
    link(c, WA, M, top, CW, 176)


def rows_page(c, number, title, desc, entries):
    header(c, '', title, desc)
    for i, (slug, note) in enumerate(entries):
        row_card(c, PRODUCTS[slug], 193+i*187, note)
    text(c, 'Imágenes ilustrativas. Consultá colores, disponibilidad y tiempos de producción.', M, 758, 8, 'Body', MUTED)
    footer(c, number)
    c.showPage()


def tools_page(c):
    header(c, '', 'Soluciones que suman.', 'Accesorios prácticos para el taller y el cuidado personal.')
    row_card(c, PRODUCTS['recolector-de-polvo-para-taladro'], 194, 'Recolector para tareas de perforación.')
    row_card(c, PRODUCTS['maquina-de-afeitar-clasica'], 382, 'Formato clásico. Consultá componentes incluidos.')
    rect(c, M, 580, CW, 172, TEAL, 12)
    text(c, 'Tu próximo pedido empieza acá.', M+18, 598, 20, 'Bold', white)
    paragraph(c, 'Indicá el producto, la variante y la cantidad. Si querés branding, enviá tu logo para confirmar el diseño.', M+18, 636, CW-36, 11, 16, color=white)
    text(c, '353 518-9997', M+18, 689, 25, 'Bold', white)
    text(c, 'Consultá colores, producción y opciones de envío.', M+18, 727, 9, 'Body', white)
    link(c, WA, M, 580, CW, 172)
    footer(c, 8)
    c.showPage()


def rounded(value):
    import math
    return math.ceil(value / 500) * 500


def main():
    for image in IMAGES.values():
        assert image.is_file(), image
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle('HÁBIL · Catálogo mayorista · Septiembre 2026')
    c.setAuthor('HÁBIL')
    c.setSubject('Selección HÁBIL. Soportes para casco y celular, recolector de polvo, afeitadora y cierre de bolsas. WhatsApp 3535189997.')
    cover(c)
    helmets(c)
    phones(c)
    rows_page(c, 4, 'Más soluciones cotidianas.', 'Los accesorios para el hogar y el taller que completan la línea.', [
        ('recolector-de-polvo-para-taladro', 'Recolector para tareas de perforación.'),
        ('maquina-de-afeitar-clasica', 'Formato clásico.'),
        ('clip-para-bolsa-de-cafe-1-kg', 'Cierre para bolsa de café de 1 kg.'),
    ])
    c.save()
    print(OUT)


if __name__ == '__main__':
    main()
