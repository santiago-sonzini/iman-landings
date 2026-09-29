// Sample the user's third reference into a point relief; no generated replacement statue.
import AppKit
import CoreGraphics
let root=CommandLine.arguments[1]
let source=NSBitmapImageRep(data:try Data(contentsOf:URL(fileURLWithPath:root+"/assets/justice-source.png")))!
let w=source.pixelsWide,h=source.pixelsHigh
let data=UnsafeMutablePointer<UInt8>.allocate(capacity:w*h*4)
defer {data.deallocate()}
let context=CGContext(data:data,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
context.draw(source.cgImage!,in:CGRect(x:0,y:0,width:w,height:h))
// Hand-traced regions select the sculpture and scales, excluding the poster background.
let outlines:[[(Double,Double)]]=[
 [(336,204),(352,213),(357,225),(369,237),(366,256),(363,276),(373,300),(384,317),(403,331),(418,350),(442,360),(465,374),(474,348),(491,327),(529,311),(531,330),(513,346),(502,370),(507,397),(509,426),(499,449),(482,450),(454,434),(436,427),(416,435),(411,469),(424,493),(437,518),(448,550),(424,572),(424,619),(423,652),(434,691),(443,735),(453,780),(448,818),(460,846),(467,881),(469,919),(471,957),(503,977),(505,995),(467,1004),(430,1001),(396,991),(378,978),(347,982),(325,977),(302,960),(283,942),(274,921),(278,882),(289,850),(293,809),(275,777),(257,741),(247,703),(247,665),(229,637),(225,606),(214,588),(207,562),(213,533),(230,516),(254,506),(269,483),(276,450),(284,420),(291,397),(309,376),(330,363),(328,341),(309,327),(294,318),(289,305),(277,299),(275,279),(278,258),(291,240),(310,229),(327,223)],
 [(175,286),(186,286),(187,312),(194,364),(201,417),(209,466),(220,510),(210,514),(201,474),(193,423),(185,370),(179,319)],
 [(482,402),(504,406),(528,412),(550,415),(570,415),(570,421),(544,421),(521,417),(502,415),(482,410)],
 [(528,416),(533,416),(503,531),(498,531)],[(531,416),(535,417),(562,530),(558,531)],
 [(493,528),(569,528),(568,539),(550,547),(515,547),(498,541)],
 [(290,979),(475,979),(511,997),(516,1012),(490,1022),(249,1022),(238,1010),(250,995)]
]
let paths=outlines.map { points -> CGPath in
 let p=CGMutablePath();p.move(to:CGPoint(x:points[0].0,y:points[0].1));for pair in points.dropFirst(){p.addLine(to:CGPoint(x:pair.0,y:pair.1))};p.closeSubpath();return p
}
var points:[[Double]]=[]
var circles:[String]=[]
let cyan=[0.46,0.81,0.87],lilac=[0.71,0.64,0.93],amber=[0.90,0.74,0.49],white=[0.94,0.93,0.90]
func mix(_ a:[Double],_ b:[Double],_ t:Double)->[Double]{zip(a,b).map{$0+(($1-$0)*t)}}
for y in stride(from:202,to:1024,by:3){for x in stride(from:171,to:574,by:3){
 let point=CGPoint(x:x,y:y)
 guard paths.contains(where:{$0.contains(point)}) else {continue}
 let k=(y*w+x)*4,r=Double(data[k])/255,g=Double(data[k+1])/255,b=Double(data[k+2])/255
 // Orange is the source's lit bronze; navy is its midtone; near-black retains depth.
 let warm=r>0.48 && r>g*1.25
 let dark=max(r,max(g,b))<0.10
 let light=warm ? 0.96 : (dark ? 0.20 : 0.49+min(0.16,b*0.22))
 let vertical=Double(y-202)/822
 let palette=vertical<0.55 ? mix(cyan,lilac,vertical/0.55) : mix(lilac,amber,(vertical-0.55)/0.45)
 let color=mix(palette,white,warm ? 0.52 : 0.04).map{$0*light}
 let rowCenter=Double(y<340 ? 328 : y<580 ? 358 : y<830 ? 348 : 377)
 let radius=Double(y<340 ? 60 : y<580 ? 110 : 98)
 let nx=(Double(x)-rowCenter)/radius
 let relief=sqrt(max(0,1-nx*nx))*0.13+(warm ? 0.038 : dark ? -0.025 : 0)
 let px=(Double(x)-370)/822,py=(613-Double(y))/822
 let size=warm ? 1.10 : (dark ? 0.70 : 0.90)
 points.append([px,py,relief,color[0],color[1],color[2],size])
 let hex=String(format:"#%02x%02x%02x",Int(color[0]*255),Int(color[1]*255),Int(color[2]*255))
 circles.append("<circle cx=\"\(x-170)\" cy=\"\(y-202)\" r=\"\(size*1.08)\" fill=\"\(hex)\"/>")
}}
let json=try JSONSerialization.data(withJSONObject:["source":"justice-source.png","kind":"image-derived point relief","points":points.map{$0.map{($0*10000).rounded()/10000}}],options:[.sortedKeys])
try json.write(to:URL(fileURLWithPath:root+"/assets/justice-points.json"))
let svg="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 404 824\" role=\"img\" aria-label=\"La Justicia representada con partículas\">"+circles.joined()+"</svg>"
try svg.write(toFile:root+"/assets/justice-static.svg",atomically:true,encoding:.utf8)
print("Justice relief: \(points.count) points from the supplied \(w)×\(h) reference.")
