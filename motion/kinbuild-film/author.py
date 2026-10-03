"""Author native, editable layers; assets/fonts are packaged in Kinbuild.tsrct.

Run with Python 3, then commit editable.json and apply actions.json using tsrct.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WORK = ROOT / '.tesseract-work'
PAPER = [245/255,244/255,240/255,1]
INK = [25/255,25/255,25/255,1]
STONE = [234/255,232/255,226/255,1]
MUTED = [89/255,89/255,84/255,1]
LINE = [216/255,213/255,205/255,1]
layers, actions = [], []

def transform(x=0,y=0,scale=100,anchor=(0,0)):
    return dict(anchorPoint=list(anchor),position=[x,y],scale=[scale,scale],rotation=0,opacity=100)

def layer(kind,name,start,end,x=0,y=0,**extra):
    item = dict(type=kind,id=len(layers)+1,name=name,blendMode='normal',
                activeRange=dict(start=round(start*1000),duration=round((end-start)*1000)),
                transform=transform(x,y),**extra)
    layers.append(item)
    return item

def animate(item,prop,expression):
    actions.append(dict(type='setFxPropertyAnimator',compositionId='main',
        property=dict(layerId=item['id'],propertyType=prop),
        animator=dict(type='jsScript',layerTimeJsCode='var t=input.time.seconds; '+expression),dependencies=[]))

def enter(item,axis='positionY',delta=38,delay=0,duration=.65):
    base=item['transform']['position'][0 if axis=='positionX' else 1]
    animate(item,axis,f'var p=Math.max(0,Math.min(1,(t-{delay})/{duration})); return {base}+{delta}*Math.pow(1-p,3);')
    animate(item,'opacity',f'return Math.min(100,Math.max(0,(t-{delay})/.24*100));')

def text(value,start,end,x,y,size=80,w=1152,color=INK,body=False,align='left',motion=True):
    item=layer('Text',value.replace('\n',' / '),start,end,x,y,sourceText=dict(
        text=value,fontFamily='Inter' if body else 'Manrope',fontStyle='Regular' if body else 'ExtraBold',
        fontSize=size,fillColor=color,strokeWidth=0,justification=align,boxText=True,
        boxPosition=[0,0],boxSize=[w,360],verticalAlign='top',leading=size*1.1,tracking=0 if body else -35))
    if motion: enter(item)
    return item

def rect(name,start,end,x,y,w,h,color):
    return layer('Rect',name,start,end,x,y,rect=dict(size=[w,h],fillColor=color,position=[0,0]))

def arch(name,start,end,x,y,scale):
    item=layer('Image',name,start,end,x,y,source=dict(assetId='arch',fit='contain'))
    item['transform']=transform(x,y,scale,(627,627))
    animate(item,'scaleX',f'return {scale}+Math.min(t,4)*1.1;')
    animate(item,'scaleY',f'return {scale}+Math.min(t,4)*1.1;')
    return item

# Layers are authored back-to-front, then reversed for Tesseract's topmost-first order.
rect('Paper canvas',0,20,0,0,1280,720,PAPER)
arch('Opening sculpture — slow approach',0,4.4,1045,385,70)
text('KINBUILD  /  A SHARED BEGINNING',0,4.4,64,44,15,body=True,motion=False)
text('01',0,2.25,64,192,18,body=True,color=MUTED)
text('An idea.',0,2.25,57,242,133,w=760)
text('Every startup begins somewhere.',0,2.25,64,435,24,body=True,w=600)
text('02',2.25,4.4,64,192,18,body=True,color=MUTED)
text('Needs\npeople.',2.25,4.4,57,235,112,w=660)
text('More than a connection. A possible co-founder.',2.25,4.4,64,525,21,body=True,w=650)

# Three strengths become one direction, in a precise stack of editorial windows.
text('DIFFERENT STRENGTHS. SHARED DIRECTION.',4.4,8.2,64,44,15,body=True,motion=False)
for i,(title,sub) in enumerate([('Skills.','What you bring'),('Mindset.','How you work'),('Direction.','What you believe in')]):
    x=64+390*i; st=4.4+.22*i
    frame=rect('Strength panel '+title,st,8.2,x,186,372,310,STONE if i!=1 else INK)
    enter(frame,'positionX',(-1 if i==0 else 1)*70,duration=.9)
    shade=PAPER if i==1 else INK
    text('0'+str(i+1),st,8.2,x+26,212,16,body=True,color=shade,w=300)
    text(title,st,8.2,x+24,292,55,w=330,color=shade)
    text(sub,st,8.2,x+26,413,19,w=320,body=True,color=shade)
line=rect('Shared direction underline',6.6,8.2,64,550,1152,2,INK)
animate(line,'scaleX','return Math.min(100,Math.max(0,t/.7*100));')
text('One shared direction.',6.6,8.2,64,576,32,w=1152)

# A distinct typographic rhythm for the four real steps.
rect('Process — dark field',8.2,10.65,0,0,1280,720,INK)
text('FROM MEETING TO MAKING',8.2,10.65,64,44,15,body=True,color=PAPER,motion=False)
for i,(word,start,end) in enumerate([('Meet.',8.2,8.9),('Match.',8.9,9.45),('Build.',9.45,9.93),('Decide.',9.93,10.65)]):
    text(word,start,end,64,222,162,w=1152,color=PAPER,align='center')
    text(f'0{i+1}  /  04',start,end,64,535,19,w=1152,color=PAPER,body=True,align='center',motion=False)
    for j in range(4): rect('Process indicator',start,end,540+j*52,598,34,3,PAPER if j==i else MUTED)

text('TURN POSSIBILITY INTO SOMETHING REAL',10.65,13.2,64,44,15,body=True,motion=False)
text('A first product.',10.65,13.2,60,196,87,w=1152)
text('A shared venture.',11.7,13.2,60,334,87,w=1152)
text('SaaS. AI. Or something the world hasn’t seen yet.',11.7,13.2,64,518,24,body=True,w=1152)
bar=rect('Product to venture line',10.65,13.2,64,584,1152,3,INK)
animate(bar,'scaleX','return Math.min(100,Math.max(0,t/2.3*100));')

arch('Investor readiness sculpture',13.2,16.5,1045,385,66)
text('WHEN YOU ARE READY',13.2,16.5,64,44,15,body=True,motion=False)
text('Think\nbigger.',13.2,16.5,57,188,115,w=700)
text('The journey towards investor readiness.',13.2,16.5,64,494,24,body=True,w=720)
text('A longer-term ambition. No promise of funding.',13.2,16.5,64,553,19,body=True,w=730,color=MUTED)

arch('Closing sculpture — shared structure',16.5,20,1080,350,62)
text('KINBUILD',16.5,20,64,44,18,body=True,motion=False)
text('Don’t build\nalone.',16.5,20,57,188,103,w=870)
text('Build a startup. Together.',17.1,20,64,500,28,body=True,w=700)
text('MELBOURNE  /  FIRST GATHERING IN THE MAKING',17.6,20,64,603,14,body=True,w=820,color=MUTED)

def audio(name,asset,start,duration,gain=1):
    item=dict(type='Audio',id=len(layers)+1,name=name,
        activeRange=dict(start=round(start*1000),duration=duration),sourceRange=dict(start=0,duration=duration),
        sourceIntrinsicDuration=duration,source=dict(assetId=asset),volume=gain,captionsEnabled=False)
    layers.append(item)
    return item

audio('English narration — connected phrases, af_heart','narration-v2',0,20000)
duck_points=[[0,1],[.48,1],[.60,.62],[14.956,.62],[15.406,1],[16.57,1],[16.65,.62],[18.655,.62],[19.055,1],[20,1]]
for stem in ['keys','pad','pulse','bass','drums']:
    music=audio('Original score — '+stem,'music-'+stem+'-v2',0,20000)
    animate(music,'volume',f'var p={json.dumps(duck_points)}; for(var i=1;i<p.length;i++){{if(t<=p[i][0]){{var a=p[i-1],b=p[i]; var u=Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0]))); return a[1]+(b[1]-a[1])*u;}}}} return p[p.length-1][1];')
doc=json.loads((WORK/'editable.json').read_text())
doc.update(dimensions=dict(width=1280,height=720),duration=20,backgroundColor=PAPER)
doc['composition']=dict(id='main',name='Kinbuild — Don’t build alone',layers=list(reversed(layers)))
(WORK/'editable.json').write_text(json.dumps(doc,indent=2)+'\n')
(WORK/'actions.json').write_text(json.dumps(actions,indent=2)+'\n')
print(f'{len(layers)} editable layers, {len(actions)} native property animations')
