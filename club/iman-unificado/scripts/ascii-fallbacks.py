from pathlib import Path
import math,random
root=Path(__file__).resolve().parents[1]
rng=random.Random(1928)
def output(name,points):
    chars='.,:;-=+*o17YPG#@'
    body=[]
    for i,(x,y,c) in enumerate(points):
        body.append(f'<text x="{x:.1f}" y="{y:.1f}" fill="{c}">{chars[i%len(chars)]}</text>')
    (root/'assets'/name).write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><g font-family="monospace" font-size="7">'+''.join(body)+'</g></svg>')
points=[]
for i in range(7600):
    a=rng.random()*math.tau;r=105+rng.random()**1.7*320
    x=450+math.cos(a)*r;y=330+math.sin(a)*r*.17
    if i%3==0:
        a=rng.random()*math.pi;r=112+rng.random()**2*86;x=450+math.cos(a)*r;y=312-math.sin(a)*r
    shade=int(60+rng.random()*174)
    points.append((x,y,f'rgb({shade},{shade},{min(255,shade+7)})'))
output('black-hole-static.svg',points)
points=[]
for i in range(4600):
    r=115+rng.random()*63
    if i%3:
        a=rng.random()*math.pi;x=450+math.cos(a)*r;y=330+math.sin(a)*r
    else:x=450+(-1 if rng.random()<.5 else 1)*r;y=330-rng.random()*170
    points.append((x,y,['#75cedd','#b5a3ee','#e5bd7c'][i%3]))
output('magnet-static.svg',points)
points=[]
for i in range(6500):
    cx,cy,r=[(355,325,140),(567,200,95),(573,462,95)][i%3]
    a=rng.random()*math.tau
    radius=r*(.77+rng.random()*.22) if i%4 else r*(.25+rng.random()*.12)
    if int(a/math.tau*32)%2:radius+=r*.07
    points.append((cx+math.cos(a)*radius,cy+math.sin(a)*radius,['#75cedd','#b5a3ee','#e5bd7c'][i%3]))
output('gears-static.svg',points)
