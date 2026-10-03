"""Original editable toy-kit scene; no external models or branded toy assets.

Blender 4.3. Run with blender -b --python build_scene.py.
Animation is 20 seconds at 24 fps; render options remain editable in the .blend.
"""
import bpy, math, random
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parent
random.seed(2438)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE_NEXT'
scene.render.resolution_x=1280; scene.render.resolution_y=720
scene.render.resolution_percentage=100
scene.render.fps=24; scene.frame_start=1; scene.frame_end=480
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGB'
scene.render.image_settings.compression=20
scene.eevee.taa_render_samples=8
scene.eevee.use_raytracing=False
scene.render.film_transparent=False
scene.render.threads_mode='FIXED'; scene.render.threads=5
scene.render.filepath=str(ROOT/'.tesseract-work/renders/frame-')
scene.view_settings.view_transform='AgX'
scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=.65
scene.world.color=(.55,.53,.48)
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.74,.72,.67,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.7

def color(hex):
    values=[int(hex[i:i+2],16)/255 for i in (0,2,4)]
    return tuple((v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4) for v in values)+(1,)

def material(name,hex,rough=.32,metal=0):
    mat=bpy.data.materials.new(name); mat.diffuse_color=color(hex); mat.use_nodes=True
    p=mat.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=color(hex)
    p.inputs['Roughness'].default_value=rough
    p.inputs['Metallic'].default_value=metal
    p.inputs['Coat Weight'].default_value=.15
    p.inputs['Coat Roughness'].default_value=.25
    return mat

paper=material('Warm studio paper','F3EFE6',.72)
ivory=material('Ivory injection-moulded plastic','F7F3E7',.26)
sand=material('Sandstone beige','CFBA99',.42)
charcoal=material('Kinbuild charcoal','303232',.31)
sage=material('Quiet sage','7D9B88',.32)
clay=material('Warm terracotta','C6815E',.33)
blue=material('Blue-grey shirt','688295',.33)
skin=material('Warm neutral toy resin','E9D1AE',.31)
dark=material('Face and keyboard details','252A2B',.35)
screen=material('Laptop screen','43515B',.23)
cream=material('Soft highlights','EDE6D6',.34)
ochre=material('Small ochre accent','D4AF62',.34)

def add_material(obj,mat): obj.data.materials.append(mat)
def smooth(obj):
    if obj.type=='MESH':
        for p in obj.data.polygons:p.use_smooth=True
def bevel(obj,amount=.04,segments=3):
    mod=obj.modifiers.new('Soft moulded edges','BEVEL'); mod.width=amount; mod.segments=segments
    mod=obj.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
    mod.keep_sharp=True

def box(name,loc,size,mat,parent=None,rounded=.045):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,0))
    obj=bpy.context.object; obj.name=name; obj.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    obj.location=loc
    if parent:obj.parent=parent
    add_material(obj,mat)
    if rounded:bevel(obj,min(rounded,min(size)*.35))
    return obj

def cylinder(name,loc,radius,depth,mat,parent=None,vertices=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=(0,0,0))
    obj=bpy.context.object;obj.name=name;obj.location=loc
    if parent:obj.parent=parent
    add_material(obj,mat);bevel(obj,min(.025,depth*.2),2);smooth(obj)
    return obj

def sphere(name,loc,size,mat,parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=1,location=(0,0,0))
    obj=bpy.context.object;obj.name=name;obj.location=loc;obj.scale=size
    if parent:obj.parent=parent
    add_material(obj,mat);smooth(obj)
    return obj

def group(name,loc=(0,0,0),parent=None):
    o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.location=loc
    if parent:o.parent=parent
    return o

def frame(t):return max(1,round(t*24)+1)
def key(obj,t,location=None,rotation=None,scale=None):
    if location is not None:obj.location=location;obj.keyframe_insert('location',frame=frame(t))
    if rotation is not None:obj.rotation_euler=rotation;obj.keyframe_insert('rotation_euler',frame=frame(t))
    if scale is not None:obj.scale=scale;obj.keyframe_insert('scale',frame=frame(t))

def snap(obj,arrival,angle=None,travel=7,height=3,spin=True):
    target=obj.location.copy(); rot=obj.rotation_euler.copy()
    if angle is None:angle=random.uniform(-math.pi,math.pi)
    start=target+Vector((math.cos(angle)*travel,math.sin(angle)*travel,random.uniform(.6,height)))
    rstart=(rot.x+random.uniform(-.7,.7),rot.y+random.uniform(-.6,.6),rot.z+random.uniform(-2.5,2.5)) if spin else rot
    key(obj,0,location=start,rotation=rstart,scale=(0,0,0))
    key(obj,max(0,arrival-.96),scale=(0,0,0))
    key(obj,max(0,arrival-.78),scale=(.65,.65,.65))
    key(obj,arrival-.38,scale=(1,1,1))
    key(obj,max(0,arrival-.90),location=start,rotation=rstart)
    mid=target+Vector((math.cos(angle)*.9,math.sin(angle)*.9,1.1))
    key(obj,arrival-.24,location=mid,rotation=(rot.x+.12,rot.y-.1,rot.z+.13))
    key(obj,arrival-.07,location=target+Vector((0,0,-.035)),rotation=rot)
    key(obj,arrival+.055,location=target+Vector((0,0,.045)),rotation=rot)
    key(obj,arrival+.15,location=target,rotation=rot)

def brick(name,loc,size,mat,nx=2,ny=2,parent=None):
    body=box(name,loc,size,mat,parent)
    dx=size[0]/nx;dy=size[1]/ny
    for x in range(nx):
        for y in range(ny):
            cylinder(name+' / stud',((x-(nx-1)/2)*dx,(y-(ny-1)/2)*dy,size[2]/2+.065),min(dx,dy)*.27,.13,mat,body,24)
    return body

def line(name,points,mat,radius=.012,parent=None):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.bevel_depth=radius;curve.bevel_resolution=3
    spline=curve.splines.new('BEZIER');spline.bezier_points.add(len(points)-1)
    for p,co in zip(spline.bezier_points,points):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    obj=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(obj);add_material(obj,mat)
    if parent:obj.parent=parent
    return obj

# A miniature kit on a continuous matte tabletop, with a restrained studded base.
box('Large studio tabletop',(0,0,-.20),(200,200,.35),paper,rounded=.1)
base=box('Collectible kit base',(0,.15,.12),(8.8,6.5,.25),ivory,rounded=.20)
for x in range(-5,6):
    for y in range(-4,5):
        if abs(x)<4 and abs(y)<3:continue
        cylinder('Baseplate stud',(x*.73,.15+y*.67,.285),.135,.09,ivory,vertices=20)

# One meaningful opening subject becomes the foundation of the first prototype.
seed=brick('The first idea / seed brick',(0,-.30,.43),(.70,.38,.22),sand,2,1)
key(seed,0,location=(0,-.30,.43),rotation=(0,0,-.15))
key(seed,.58,location=(0,-.30,.66),rotation=(0,0,.12))
key(seed,.94,location=(0,-.30,.43),rotation=(0,0,0))
key(seed,1.50,location=(0,.12,2.0),rotation=(.2,.1,.35))
key(seed,2.38,location=(0,.37,1.49),rotation=(0,0,0))
key(seed,2.55,location=(0,.37,1.44),rotation=(0,0,0))

# Furniture assembles from separate physical parts.
for i,(x,y) in enumerate([(-.95,-.77),(.95,-.77),(-.95,.37),(.95,.37)]):
    leg=cylinder('Meeting table leg '+str(i),(x,y,.73),.105,.86,charcoal)
    snap(leg,1.7+i*.13,travel=6,spin=False)
table=box('The shared worktable',(0,-.2,1.23),(2.8,1.78,.19),ivory,rounded=.16)
snap(table,2.45,angle=-.9,travel=6,spin=True)
for x in [-1.12,1.12]:
    join=brick('Table corner connection',(x,-.20,1.345),(.38,.40,.06),sand,1,1)
    snap(join,2.7+(x+1.12)*.09,travel=7)

def founder(name,pos,yaw,shirt,arrival,hair_style):
    root=group(name+' / seated builder',pos);root.rotation_euler.z=yaw
    seat=box(name+' / chair seat',(0,.03,.78),(.88,.86,.14),sand,root,.08);snap(seat,arrival-.7,travel=6)
    back=box(name+' / chair back',(0,.40,1.21),(.85,.13,.76),sand,root,.055);snap(back,arrival-.55,travel=6)
    for i,(x,y) in enumerate([(-.29,-.22),(.29,-.22),(-.29,.28),(.29,.28)]):
        leg=cylinder(name+' / chair leg '+str(i),(x,y,.46),.065,.44,charcoal,root,20);snap(leg,arrival-.8+i*.035,travel=6)
    pelvis=box(name+' / trousers',(0,-.06,.98),(.53,.39,.28),charcoal,root,.055);snap(pelvis,arrival-.15,travel=7)
    for side in [-1,1]:
        thigh=box(name+' / seated leg',(side*.15,-.26,.89),(.24,.60,.23),charcoal,root,.045);snap(thigh,arrival-.12+side*.06,travel=7)
        shin=box(name+' / lower leg',(side*.15,-.49,.63),(.23,.23,.40),charcoal,root,.03);snap(shin,arrival-.18+side*.06,travel=7)
        shoe=box(name+' / shoe',(side*.15,-.56,.42),(.26,.38,.15),ivory,root,.05);snap(shoe,arrival-.10+side*.06,travel=7)
    torso=brick(name+' / torso',(0,-.015,1.39),(.63,.40,.62),shirt,2,1,root);snap(torso,arrival+.05,travel=7)
    neck=cylinder(name+' / neck',(0,-.015,1.765),.115,.11,skin,root);snap(neck,arrival+.20,travel=7)
    head=cylinder(name+' / head',(0,-.015,2.01),.248,.43,skin,root,40)
    for side in [-1,1]:
        sphere(name+' / eye',(side*.086,-.234,.048),(.025,.014,.027),dark,head)
    line(name+' / smile',[(-.065,-.240,-.055),(0,-.250,-.081),(.065,-.240,-.055)],dark,.010,head)
    if hair_style==0:
        cap=cylinder(name+' / hair cap',(0,.015,.215),.263,.12,charcoal,head,40)
        box(name+' / side part',(-.09,-.13,.22),(.35,.25,.12),charcoal,head,.055)
    elif hair_style==1:
        cylinder(name+' / round hair',(0,.045,.22),.27,.16,sand,head,40)
        sphere(name+' / bun',(0,.21,.25),(.16,.16,.14),sand,head)
    else:
        cylinder(name+' / top stud',(0,0,.255),.108,.095,skin,head,32)
    snap(head,arrival+.38,travel=7)
    for t,tilt in [(6.5,0),(7.5,.11),(8.4,0),(10.2,.09),(11.2,0),(13.0,.07),(13.8,0)]:
        if t>arrival+.6:key(head,t,rotation=(tilt,0,math.sin(t+arrival)*.06))
    for side in [-1,1]:
        arm=group(name+' / arm gesture',(side*.40,-.03,1.57),root)
        box(name+' / upper arm',(0,0,-.17),(.19,.23,.43),shirt,arm,.06)
        box(name+' / forearm',(0,-.17,-.35),(.19,.48,.19),shirt,arm,.06)
        hand=cylinder(name+' / grip',(0,-.43,-.35),.115,.16,skin,arm,24)
        hand.rotation_euler.x=math.pi/2
        snap(arm,arrival+.30+side*.06,travel=6)
        if side<0:
            for t,rot in [(6.5,0),(7.2,-.20),(8.0,0),(9.7,-.24),(10.6,0),(12.2,-.15),(13.0,0)]:
                key(arm,t,rotation=(rot,0,0))
    return root

founder('Sage builder',(-1.95,-.15,0),math.pi/2,sage,4.15,1)
founder('Clay builder',(1.95,-.15,0),-math.pi/2,clay,4.55,2)
founder('Blue builder',(0,1.27,0),0,blue,4.95,0)

# Small, recognizable startup-workshop details; no fake production UI.
def laptop(name,x,y,yaw,at):
    root=group(name,(x,y,1.345));root.rotation_euler.z=yaw
    deck=box(name+' / base',(0,-.08,0),(.76,.48,.045),charcoal,root,.035)
    panel=box(name+' / lid',(0,.14,.27),(.76,.055,.51),charcoal,root,.025);panel.rotation_euler.x=-.13
    face=box(name+' / screen',(0,-.031,0),(.66,.009,.40),screen,panel,.012)
    for i in range(3):
        box(name+' / interface tile',(-.205+i*.20,-.04,.03),(.145,.012,.11),[sage,clay,cream][i],panel,.012)
        box(name+' / interface line',(-.205+i*.20,-.04,-.065),(.145,.012,.018),cream,panel,.003)
    for row in range(3):
        for col in range(7):box(name+' / key',(-.26+col*.086,-.21+row*.086,.03),(.052,.050,.009),cream,deck,.002)
    snap(root,at,travel=7,spin=False)

laptop('First prototype',-.63,-.32,.20,6.05)
laptop('Shared work',.64,-.08,-.36,6.35)

for i,(x,y,z,col) in enumerate([(-.18,.37,1.66,sage),(.16,.37,1.66,clay),(0,.37,1.88,ochre)]):
    piece=brick('A first product / block '+str(i),(x,y,z),(.31,.34,.18),col,1,1)
    snap(piece,8.25+i*1.03,angle=-1.8+i*.5,travel=5,height=2)

mug=cylinder('Coffee on the table',(.77,-.73,1.50),.12,.26,clay)
cylinder('Coffee surface',(0,0,.135),.092,.012,charcoal,mug,24)
line('Mug handle',[(.1,0,.08),(.21,0,.06),(.21,0,-.065),(.1,0,-.085)],clay,.025,mug)
snap(mug,6.75,travel=6,spin=False)

board=group('Idea board',(-2.95,1.65,.29));board.rotation_euler.z=.16
for x in [-.50,.50]:box('Idea board foot',(x,0,.6),(.10,.40,1.2),charcoal,board,.025)
frameobj=box('Idea board frame',(0,0,1.51),(1.65,.16,1.38),charcoal,board,.045)
box('Idea board white surface',(0,-.091,1.51),(1.51,.028,1.24),ivory,board,.02)
for i,col in enumerate([sage,clay,ochre]):
    box('Idea board / sticky tile',(-.46+i*.45,-.12,1.70),(.33,.025,.29),col,board,.015)
    box('Idea board / connecting line',(-.46+i*.45,-.12,1.36),(.29,.025,.035),sand,board,.005)
snap(board,7.10,travel=7,spin=False)

plant=group('Little desk plant',(2.97,-1.83,.3))
cylinder('Plant pot',(0,0,.19),.25,.39,sand,plant)
cylinder('Plant pot opening',(0,0,.39),.212,.025,charcoal,plant)
for i in range(5):
    a=i*2*math.pi/5
    leaf=sphere('Toy plant leaf',(math.cos(a)*.12,math.sin(a)*.12,.64),(.095,.08,.32),sage,plant)
    leaf.rotation_euler=(math.sin(a)*.50,math.cos(a)*.50,0)
snap(plant,9.25,travel=7,spin=False)

# The real logo's geometry becomes a buildable monument behind the team.
# Twelve interlocking components take a radial arc into their final positions.
for level in range(4):
    left=brick('Logo / sandstone support '+str(level),(-2.38,2.34,.69+level*.76),(1.14,1.12,.72),sand,2,2)
    snap(left,13.15+level*.48,angle=-2.6+level*.25,travel=9,height=4)
    right=cylinder('Logo / ivory column '+str(level),(2.38,2.34,.69+level*.76),.64,.72,ivory,vertices=48)
    cylinder('Logo / round connection',(0,0,.405),.35,.095,ivory,right,32)
    snap(right,13.35+level*.48,angle=.1+level*.3,travel=9,height=4)
for i in range(4):
    top=brick('Logo / charcoal lintel '+str(i),(-2.37+i*1.58,2.34,3.74),(1.55,1.18,.74),charcoal,2,2)
    snap(top,15.25+i*.37,angle=1.0+i*.5,travel=9,height=5)

# A brief burst of spare connection pieces celebrates the final snap, then settles.
for i in range(7):
    a=i*2*math.pi/7
    o=brick('Loose kit piece '+str(i),(math.cos(a)*3.55,-.25+math.sin(a)*2.3,.40),(.48,.48,.20),[ivory,sage,sand,clay][i%4],1,1)
    final=o.location.copy()
    key(o,0,location=(final.x*2.5,final.y*2.5,.40),rotation=(0,0,a),scale=(0,0,0))
    key(o,12.35,scale=(0,0,0))
    key(o,12.65,scale=(1,1,1))
    key(o,12.4,location=(final.x*2.5,final.y*2.5,.40),rotation=(0,0,a))
    key(o,14.3,location=(math.cos(a)*4.2,math.sin(a)*2.8,2.3+(i%3)*.35),rotation=(.5,.3,a+math.pi))
    key(o,16.45,location=final+Vector((0,0,.04)),rotation=(0,0,a+2*math.pi))
    key(o,16.7,location=final,rotation=(0,0,a+2*math.pi))

# Studio lighting produces physical contact and soft plastic highlights.
def area(name,loc,power,size,target):
    bpy.ops.object.light_add(type='AREA',location=loc)
    o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Large soft key',(-4,-5,10),1500,7,(0,0,0))
area('Cool fill',(6,-1,6),850,6,(0,0,1.5))
area('Top rim',(-1,6,9),1200,5,(0,0,1.8))

bpy.ops.object.camera_add(location=(8,-11,10));camera=bpy.context.object;camera.name='Kinbuild film camera';scene.camera=camera
camera.data.type='ORTHO';camera.data.lens=55;camera.data.clip_end=300
def shot(t,loc,target,scale,shift=0):
    camera.location=loc;camera.rotation_euler=(Vector(target)-Vector(loc)).to_track_quat('-Z','Y').to_euler()
    camera.data.ortho_scale=scale;camera.data.shift_x=shift
    camera.keyframe_insert('location',frame=frame(t));camera.keyframe_insert('rotation_euler',frame=frame(t))
    camera.data.keyframe_insert('ortho_scale',frame=frame(t));camera.data.keyframe_insert('shift_x',frame=frame(t))
shot(0,(5,-7,8),(0,-.3,.45),4.5)
shot(1.50,(6,-8,8),(0,.1,1.10),6.5)
shot(4.08,(7,-9,7),(0,.15,1.1),10.4)
shot(4.125,(6,-8,5.8),(0,.12,1.35),7.4)
shot(8.20,(4.8,-8.6,5.6),(0,.15,1.4),7.2)
shot(8.25,(-5.7,-8.1,6.4),(0,.25,1.35),8.2)
shot(12.32,(-6.8,-7.8,6.6),(0,.20,1.35),8.5)
shot(12.375,(8,-11,9),(0,.3,1.3),13.8)
shot(16.45,(7.5,-11,8),(0,.3,1.75),13.0)
shot(16.50,(-7.5,-12,8.3),(0,.4,1.65),15.3,-.17)
shot(20,(-7.0,-12.3,8.0),(0,.4,1.65),15.0,-.17)

# Auto-clamped curves give a quick snap without unpredictable Bezier overshoot.
for obj in bpy.data.objects:
    for holder in [obj,obj.data if hasattr(obj,'data') else None]:
        if holder and hasattr(holder,'animation_data') and holder.animation_data and holder.animation_data.action:
            for fc in holder.animation_data.action.fcurves:
                for k in fc.keyframe_points:
                    k.interpolation='BEZIER';k.handle_left_type='AUTO_CLAMPED';k.handle_right_type='AUTO_CLAMPED'

# Also keep a fast, useful studio-viewport rendering mode available in the source.
sh=scene.display.shading
sh.light='STUDIO';sh.studio_light='paint.sl';sh.color_type='MATERIAL'
sh.show_shadows=True;sh.show_cavity=True;sh.cavity_type='BOTH'
sh.curvature_ridge_factor=1.25;sh.curvature_valley_factor=1.1
sh.cavity_ridge_factor=1.1;sh.cavity_valley_factor=1.1
sh.show_specular_highlight=True;sh.background_type='WORLD'
scene.display.render_aa='16'
scene.frame_set(289)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'Kinbuild-toykit.blend'))
print('SCENE_OBJECTS',len(bpy.data.objects),flush=True)
