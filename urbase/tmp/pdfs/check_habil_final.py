from pathlib import Path
from pypdf import PdfReader
import pdfplumber

path = Path('/Users/santiagosonzini/Desktop/landings/urbase/output/pdf/HABIL_catalogo_mayorista.pdf')
reader = PdfReader(path)
assert len(reader.pages) == 4
texts = [page.extract_text() for page in reader.pages]
full = '\n'.join(texts)
for price in ['$12.000', '$10.500', '$13.000', '$11.500', '$1.500', '$2.000', '$2.500', '$4.000', '$7.500']:
    assert price in full, price
for excluded in ['auriculares', 'Caja con olas', 'Posavasos', 'Pico regulable', 'mampara', 'Llavero', 'reforzado', 'urbase.store']:
    assert excluded not in full, excluded
for removed in ['OBJETOS ÚTILES', '353 518-9997', 'PEDIDOS Y PERSONALIZACIÓN']:
    assert removed not in texts[0], removed
for page in reader.pages:
    for ref in page.get('/Annots', []):
        annotation = ref.get_object()
        uri = annotation.get('/A', {}).get('/URI', '')
        if uri:
            assert uri.startswith('https://wa.me/5493535189997'), uri
with pdfplumber.open(path) as pdf:
    for page in pdf.pages:
        for char in page.chars:
            assert -0.5 <= char['x0'] <= char['x1'] <= page.width + 0.5
            assert -0.5 <= char['top'] <= char['bottom'] <= page.height + 0.5
print('PASS: 4 pages, original helmet tiers, rounded prices, only selected products, cleaned cover, correct WhatsApp, no purchase links, text within page bounds.')
