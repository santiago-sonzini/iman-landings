// Preserve the supplied raster geometry; remove only its black background.
import AppKit
import ImageIO
let root = CommandLine.arguments[1]
let original = NSBitmapImageRep(data: try Data(contentsOf: URL(fileURLWithPath: root + "/assets/brand-symbol-source.png")))!
let w = original.pixelsWide, h = original.pixelsHigh
let mask = NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:w,pixelsHigh:h,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:w*4,bitsPerPixel:32)!
let sourceImage = original.cgImage!
let space = CGColorSpaceCreateDeviceRGB()
let rgba = UnsafeMutablePointer<UInt8>.allocate(capacity:w*h*4)
defer {rgba.deallocate()}
let bitmapContext = CGContext(data:rgba,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:space,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
bitmapContext.draw(sourceImage,in:CGRect(x:0,y:0,width:w,height:h))
let destination=mask.bitmapData!
for offset in stride(from:0,to:w*h*4,by:4) {
    let strength=max(rgba[offset],max(rgba[offset+1],rgba[offset+2]))
    let alpha=UInt8(min(255,max(0,(Double(strength)-30.6)/0.8)))
    destination[offset]=240;destination[offset+1]=238;destination[offset+2]=231;destination[offset+3]=alpha
}
try mask.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:root+"/assets/brand-symbol.png"))
let symbol = NSImage(size:NSSize(width:w,height:h));symbol.addRepresentation(mask)
func exportSmall(_ name:String,_ size:Int) throws {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:size,pixelsHigh:size,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:size*4,bitsPerPixel:32)!
    NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=NSGraphicsContext(bitmapImageRep:bitmap)
    symbol.draw(in:NSRect(x:0,y:0,width:size,height:size),from:.zero,operation:.copy,fraction:1)
    NSGraphicsContext.restoreGraphicsState()
    try bitmap.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:root+"/assets/"+name))
}
try exportSmall("brand-favicon.png",64)
try exportSmall("brand-email.png",160)
print("Exact raster mask: \(w)×\(h); favicon and email sizes exported.")
