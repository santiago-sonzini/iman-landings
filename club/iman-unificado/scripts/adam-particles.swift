import AppKit
import CoreGraphics
let root=CommandLine.arguments[1]
let image=NSBitmapImageRep(data:try Data(contentsOf:URL(fileURLWithPath:root+"/assets/adam-source.png")))!
let w=image.pixelsWide,h=image.pixelsHigh
let raw=UnsafeMutablePointer<UInt8>.allocate(capacity:w*h*4)
defer {raw.deallocate()}
let ctx=CGContext(data:raw,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(image.cgImage!,in:CGRect(x:0,y:0,width:w,height:h))
var points:[[Double]]=[]
for y in stride(from:1,to:h-2,by:3){for x in stride(from:1,to:w-2,by:2){
 var brightness=0.0
 for dy in -1...1 {for dx in -1...1{let k=((y+dy)*w+x+dx)*4;brightness+=Double(raw[k])+Double(raw[k+1])+Double(raw[k+2])}}
 brightness/=27*255
 if brightness<0.027 {continue}
 let light=min(1,0.28+brightness*1.6)
 let phase=Double(x)/Double(w)
 let color=[0.72+phase*0.18,0.84-phase*0.12,0.90-phase*0.1].map{$0*light}
 let center=x<368 ? 155.0 : 239.0
 let z=max(0,1-pow((Double(y)-center)/130,2))*0.11+brightness*0.06
 points.append([(Double(x)-368)/736*1.48,(207-Double(y))/736*1.48,z,color[0],color[1],color[2],0.76+brightness*0.8,x<368 ? 0 : 1])
}}
let json=try JSONSerialization.data(withJSONObject:["source":"adam-source.png","points":points.map{$0.map{($0*10000).rounded()/10000}}],options:[])
try json.write(to:URL(fileURLWithPath:root+"/assets/adam-points.json"))
print("Adán: \(points.count) samples from original ASCII reference")
