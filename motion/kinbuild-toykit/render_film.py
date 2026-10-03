"""Render an intentionally stepped toy animation: 12 poses/sec in a 24 fps film.

Each frame is independent and restartable. Inspect one frame per second first,
then fill the intervening poses. Existing frames are retained on resume.
"""
from pathlib import Path
import bpy,time,json

root=Path(__file__).resolve().parent
out=root/'.tesseract-work/renders'
out.mkdir(parents=True,exist_ok=True)
s=bpy.context.scene
s.render.engine='BLENDER_EEVEE_NEXT'
s.eevee.taa_render_samples=6
s.render.resolution_percentage=75
s.render.use_persistent_data=True
all_frames=list(range(1,481,2))
review=list(range(1,481,24))
order=review+[f for f in all_frames if f not in review]
started=time.time()
for i,f in enumerate(order):
    path=out/f'frame-{f:04d}.png'
    if path.exists():continue
    s.frame_set(f);s.render.filepath=str(path)
    bpy.ops.render.render(write_still=True)
    done=sum((out/f'frame-{x:04d}.png').exists() for x in all_frames)
    status=dict(completed=done,total=len(all_frames),frame=f,elapsedSeconds=round(time.time()-started,1),reviewReady=all((out/f'frame-{x:04d}.png').exists() for x in review))
    (out.parent/'render-progress.json').write_text(json.dumps(status)+'\n')
    print('KINBUILD_PROGRESS',json.dumps(status),flush=True)
print('KINBUILD_RENDER_COMPLETE',flush=True)
