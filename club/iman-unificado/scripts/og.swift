import AppKit
let image = NSImage(size: NSSize(width: 1200, height: 630))
image.lockFocus()
let paper = NSColor(calibratedRed: 1, green: 1, blue: 1, alpha: 1)
let ink = NSColor(calibratedRed: 0.063, green: 0.067, blue: 0.086, alpha: 1)
let violet = NSColor(calibratedRed: 0.31, green: 0.275, blue: 0.961, alpha: 1)
paper.setFill(); NSRect(x: 0, y: 0, width: 1200, height: 630).fill()
func text(_ string: String, _ x: CGFloat, _ y: CGFloat, _ size: CGFloat, _ color: NSColor, _ font: String = "HelveticaNeue-Medium") {
  let attributes: [NSAttributedString.Key:Any] = [.font:NSFont(name:font,size:size) ?? NSFont.systemFont(ofSize:size), .foregroundColor:color]
  (string as NSString).draw(at:NSPoint(x:x,y:y),withAttributes:attributes)
}
text("Imán", 64, 530, 45, ink, "HelveticaNeue-Bold")
text("FIDELIZACIÓN PARA NEGOCIOS REALES", 64, 468, 14, violet)
text("Aumentá tus ventas", 60, 350, 67, ink, "HelveticaNeue-Bold")
text("sin invertir en", 60, 264, 70, ink, "HelveticaNeue-Bold")
text("publicidad.", 60, 174, 70, violet, "HelveticaNeue-Bold")
text("Wallet · Notificaciones · Email", 64, 93, 22, ink)
text("iman.ar", 1055, 38, 17, ink)
violet.setFill()
NSBezierPath(roundedRect:NSRect(x: 830, y: 176, width: 300, height: 305),xRadius:22,yRadius:22).fill()
text("tu marca.", 860, 404, 32, paper, "HelveticaNeue-Bold")
text("CLUB DE CLIENTES", 860, 348, 12, paper)
text("Volver tiene", 860, 280, 28, paper)
text("sus beneficios.", 860, 244, 28, paper)
text("APPLE WALLET + GOOGLE WALLET", 841, 139, 12, ink)
ink.withAlphaComponent(0.15).setStroke()
let line = NSBezierPath(); line.move(to: NSPoint(x:64,y:70));line.line(to:NSPoint(x:1136,y:70));line.lineWidth=1;line.stroke()
image.unlockFocus()
let bitmap = NSBitmapImageRep(data: image.tiffRepresentation!)!
let data = bitmap.representation(using: .png, properties: [:])!
try data.write(to:URL(fileURLWithPath:CommandLine.arguments[1]))
