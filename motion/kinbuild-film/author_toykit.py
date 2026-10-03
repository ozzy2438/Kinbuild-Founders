"""Native film edit around the original Blender toy-kit footage.

Run after importing the footage, then commit the document and apply actions.
Use --asset-id to inspect a temporary storyboard source without replacing assets.
"""
import argparse,json
from pathlib import Path

args=argparse.ArgumentParser()
args.add_argument('--asset-id',default='toykit-3d-v3')
args.add_argument('--output-prefix',default='film')
opt=args.parse_args()
ROOT=Path(__file__).resolve().parent
WORK=ROOT/'.tesseract-work/v3'
INK=[25/255,25/255,25/255,1]
MUTED=[76/255,76/255,71/255,1]
layers=[];actions=[]

def transform(x=0,y=0):
    return dict(anchorPoint=[0,0],position=[x,y],scale=[100,100],rotation=0,opacity=100)
def animate(id,prop,body):
    actions.append(dict(type='setFxPropertyAnimator',compositionId='main',property=dict(layerId=id,propertyType=prop),
        animator=dict(type='jsScript',layerTimeJsCode='var t=input.time.seconds; '+body),dependencies=[]))

video=dict(type='Video',id=1000,name='Original 3D toy-kit assembly — Blender source',blendMode='normal',
    activeRange=dict(start=0,duration=20000),sourceRange=dict(start=0,duration=20000),sourceIntrinsicDuration=20000,
    source=dict(assetId=opt.asset_id,fit='contain'),volume=0,
    transform=dict(anchorPoint=[480,270],position=[640,360],scale=[133.333333,133.333333],rotation=0,opacity=100))
layers.append(video)

def text(value,start,end,x,y,size,width,body=False,align='left',muted=False,entrance=False):
    id=2000+len(layers)
    layer=dict(type='Text',id=id,name=value.replace('\n',' / '),blendMode='normal',
      activeRange=dict(start=round(start*1000),duration=round((end-start)*1000)),transform=transform(x,y),
      sourceText=dict(text=value,fontFamily='Inter' if body else 'Manrope',fontStyle='Regular' if body else 'ExtraBold',
        fontSize=size,fillColor=MUTED if muted else INK,strokeWidth=0,justification=align,
        boxText=True,boxPosition=[0,0],boxSize=[width,260],verticalAlign='top',leading=size*1.16,tracking=0 if body else -30))
    layers.append(layer)
    if entrance:
        animate(id,'opacity','return Math.min(100,Math.max(0,t/.45*100));')
        animate(id,'positionY',f'return {y}+22*Math.pow(1-Math.min(1,t/.65),3);')

text('KINBUILD',0,16.5,52,32,15,200,body=True)
for start,end,caption in [
    (0,4.125,'01  /  ONE IDEA'),
    (4.125,8.25,'02  /  FIND YOUR PEOPLE'),
    (8.25,12.375,'03  /  MAKE SOMETHING REAL'),
    (12.375,16.5,'04  /  BUILD TOGETHER'),
]:
    text(caption,start,end,812,34,11,416,body=True,align='right',muted=True)

text('KINBUILD',16.5,20,64,65,18,370,body=True)
text('Don’t build\nalone.',16.85,20,60,242,62,370,entrance=True)
text('Build a startup.\nTogether.',17.12,20,64,419,24,340,body=True,entrance=True)
text('MELBOURNE  /  FOUNDING PILOT',17.5,20,64,534,11,350,body=True,muted=True,entrance=True)

def audio(id,name,asset,volume=1):
    layers.append(dict(type='Audio',id=id,name=name,
        activeRange=dict(start=0,duration=20000),sourceRange=dict(start=0,duration=20000),sourceIntrinsicDuration=20000,
        source=dict(assetId=asset),volume=volume,captionsEnabled=False))

audio(3000,'Approved narration — unchanged source and timing','narration-v2')
points=[[0,1],[.48,1],[.60,.62],[14.956,.62],[15.406,1],[16.57,1],[16.65,.62],[18.655,.62],[19.055,1],[20,1]]
for i,stem in enumerate(['keys','pad','pulse','bass','drums','momentum']):
    asset='music-'+stem+('-v3' if stem=='momentum' else '-v2')
    id=3010+i
    gain=1.16 if stem=='pulse' else 1
    audio(id,'Original score — '+stem,asset,gain)
    animate(id,'volume',f'var p={json.dumps(points)}; for(var i=1;i<p.length;i++){{if(t<=p[i][0]){{var a=p[i-1],b=p[i]; var u=Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0]))); return {gain}*(a[1]+(b[1]-a[1])*u);}}}} return {gain}*p[p.length-1][1];')
audio(3020,'Tactile toy connections','toy-connections-v3')

doc=json.loads((WORK/'native-before.json').read_text())
doc['composition']=dict(id='main',name='Kinbuild — the pieces become a team',layers=list(reversed(layers)))
doc['dimensions']=dict(width=1280,height=720);doc['duration']=20
(WORK/(opt.output_prefix+'-editable.json')).write_text(json.dumps(doc,indent=2)+'\n')
(WORK/(opt.output_prefix+'-actions.json')).write_text(json.dumps(actions,indent=2)+'\n')
print(f'{len(layers)} native layers, {len(actions)} animations; {opt.asset_id}')
