import AppKit
import CoreText
let root = CommandLine.arguments[1]
CTFontManagerRegisterFontsForURL(URL(fileURLWithPath: root + "/assets/fonts/barlow-condensed-light.ttf") as CFURL, .process, nil)
let image = NSImage(size: NSSize(width:1200,height:630))
image.lockFocus()
let paper=NSColor(srgbRed:39/255,green:39/255,blue:39/255,alpha:1)
let ink=NSColor(srgbRed:238/255,green:234/255,blue:225/255,alpha:1)
let muted=NSColor(srgbRed:154/255,green:166/255,blue:153/255,alpha:1)
let cyan=NSColor(srgbRed:117/255,green:206/255,blue:221/255,alpha:1)
paper.setFill();NSRect(x:0,y:0,width:1200,height:630).fill()
func text(_ value:String,_ x:CGFloat,_ y:CGFloat,_ size:CGFloat,_ color:NSColor,_ font:String="HelveticaNeue") {(value as NSString).draw(at:NSPoint(x:x,y:y),withAttributes:[.font:NSFont(name:font,size:size) ?? NSFont.systemFont(ofSize:size),.foregroundColor:color])}
text("TECNOLOGÍA A MEDIDA / ARGENTINA",64,555,12,muted,"Menlo-Regular")
text("Tu empresa,",64,392,86,ink,"BarlowCondensed-Light")
text("llevada al",64,295,86,ink,"BarlowCondensed-Light")
text("siguiente nivel.",64,198,86,cyan,"BarlowCondensed-Light")
let symbol = NSImage(contentsOfFile:root+"/assets/brand-symbol.png")!
symbol.draw(in:NSRect(x:680,y:145,width:470,height:470))


let line=NSBezierPath();line.move(to:NSPoint(x:64,y:115));line.line(to:NSPoint(x:1136,y:115));line.lineWidth=0.7;muted.withAlphaComponent(0.4).setStroke();line.stroke()
text("FIDELIZACIÓN   /   CATÁLOGOS   /   AUTOMATIZACIONES   /   AGENTES",64,70,11,muted,"Menlo-Regular")
text("iman.ar",1047,67,16,ink)
cyan.setFill();NSBezierPath(ovalIn:NSRect(x:1090,y:546,width:6,height:6)).fill()
image.unlockFocus()
let bitmap=NSBitmapImageRep(data:image.tiffRepresentation!)!
try bitmap.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:root+"/assets/editorial-og.png"))
