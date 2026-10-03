"""Render the approved animation directly at 1920×1080; no image upscaling.

Use Blender 4.3.2 with Kinbuild-toykit.blend. Output is kept separate from the
old 540p frames. Frame poses and timing are identical to revision 3.
"""
from pathlib import Path
import bpy
import json
import time

root = Path(__file__).resolve().parent
out = root / '.tesseract-work/v4/renders'
out.mkdir(parents=True, exist_ok=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.filter_size = .8
scene.render.use_motion_blur = False
scene.camera.data.dof.use_dof = False
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.image_settings.compression = 15
scene.render.threads_mode = 'FIXED'
scene.render.threads = 5
scene.render.use_persistent_data = True
scene.eevee.taa_render_samples = 6
scene.eevee.shadow_step_count = 2

# The key supplies contact shadows; fill and rim supply clean, even light.
for obj in bpy.data.objects:
    if obj.type == 'LIGHT' and obj.name != 'Large soft key':
        obj.data.use_shadow = False

# Matte paper needs diffuse shading, not the toys' plastic coating.
paper = bpy.data.materials['Warm studio paper']
nodes = paper.node_tree.nodes
principled = nodes.get('Principled BSDF')
diffuse = nodes.get('HD matte paper') or nodes.new('ShaderNodeBsdfDiffuse')
diffuse.name = 'HD matte paper'
diffuse.inputs['Color'].default_value = principled.inputs['Base Color'].default_value
paper.node_tree.links.new(diffuse.outputs['BSDF'], nodes.get('Material Output').inputs['Surface'])
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Kinbuild-toykit-HD.blend'))

all_frames = list(range(1,481,2))
review = [1,37,77,101,149,179,199,265,313,373,403,433,457,479]
order = review + [f for f in all_frames if f not in review]
started = time.time()
for f in order:
    path = out / f'frame-{f:04d}.png'
    if path.exists():
        continue
    scene.frame_set(f)
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    done = sum((out/f'frame-{i:04d}.png').exists() for i in all_frames)
    progress = dict(completed=done,total=len(all_frames),frame=f,
        elapsedSeconds=round(time.time()-started,1),resolution=[1920,1080],
        reviewReady=all((out/f'frame-{i:04d}.png').exists() for i in review))
    (out.parent/'progress.json').write_text(json.dumps(progress)+'\n')
    print('KINBUILD_HD_PROGRESS',json.dumps(progress),flush=True)
print('KINBUILD_HD_RENDER_COMPLETE',flush=True)
