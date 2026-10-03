"""Export true 1080p picture and copy the approved v3 audio without reencoding."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--tsrct', required=True)
parser.add_argument('--finish-only', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parent
repo = root.parent.parent
work = root/'.tesseract-work/v4'
project = root/'Kinbuild.tsrct'
frames = root.parent/'kinbuild-toykit/.tesseract-work/v4/renders'
env = os.environ.copy()
env.setdefault('VK_ICD_FILENAMES','/usr/lib/chromium/vk_swiftshader_icd.json')

def run(*command):
    print('RUN',str(command[0]),str(command[1]) if len(command)>1 else '',flush=True)
    subprocess.run([str(v) for v in command],check=True,env=env)

def audio_hash(path):
    return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-map','0:a:0',
        '-c','copy','-f','hash','-hash','sha256','-'],text=True).strip()

expected = [frames/f'frame-{f:04d}.png' for f in range(1,481,2)]
assert all(p.exists() for p in expected),'HD frames are incomplete'
assert len(list(frames.glob('frame-*.png')))==240
for path in expected:
    with Image.open(path) as frame:
        assert frame.size==(1920,1080),(path,frame.size)

if not args.finish_only:
    run('ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','12',
        '-pattern_type','glob','-i',frames/'frame-*.png','-vf','fps=24',
        '-c:v','libx264','-preset','slow','-crf','12','-pix_fmt','yuv420p',
        '-movflags','+faststart','-an',work/'toykit-1080.mp4')
    run(args.tsrct,'project','import-video','--project',project,
        '--file',work/'toykit-1080.mp4','--asset-id','toykit-1080-v4')
    run(sys.executable,root/'author_hd.py')
    run(args.tsrct,'project','commit','--project',project,'--file',work/'hd-editable.json')
    run(args.tsrct,'filmstrip','--project',project,'--timestamps-ms',
        '0,1500,3200,4200,6200,8300,11000,13000,15500,16750,18000,19500',
        '--tile-width','320','--tile-height','180','--items-per-row','4',
        '--output',root/'Previews/filmstrip-v4-HD.png')
    run(args.tsrct,'export','--project',project,'--output',work/'native-export.mov',
        '--format','prores','--resolution','1080p','--fps','24',
        '--encoder-backend','external-ffmpeg-command','--ffmpeg-path','/usr/bin/ffmpeg')

film = root/'Kinbuild-film.mp4'
run('ffmpeg','-hide_banner','-loglevel','error','-y','-i',work/'native-export.mov',
    '-i',work/'film-before.mp4','-map','0:v:0','-map','1:a:0',
    '-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p',
    '-c:a','copy','-movflags','+faststart','-t','20',film)
probe = json.loads(subprocess.check_output(['ffprobe','-v','error',
    '-show_entries','stream=codec_name,width,height,r_frame_rate,duration,sample_rate,start_time,time_base',
    '-of','json',str(film)]))
video = probe['streams'][0]
assert video['width']==1920 and video['height']==1080,probe
assert video['r_frame_rate']=='24/1' and float(video['duration'])==20,probe
before_audio = audio_hash(work/'film-before.mp4')
after_audio = audio_hash(film)
assert before_audio==after_audio,'Approved audio packets changed'
old_audio = json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','a:0',
    '-show_entries','stream=start_time,duration,time_base','-of','json',str(work/'film-before.mp4')]))['streams'][0]
for key in ['start_time','duration','time_base']:
    assert probe['streams'][1][key]==old_audio[key],('Audio timeline changed',key,probe,old_audio)

shutil.copyfile(film,repo/'public/media/kinbuild-film.mp4')
shutil.copyfile(film,repo/'artifacts/Kinbuild-film-HD.mp4')
run('ffmpeg','-hide_banner','-loglevel','error','-y','-ss','18.6','-i',film,
    '-frames:v','1','-q:v','95',repo/'public/media/kinbuild-poster.webp')
manifest = dict(revision='v4 — native 1080p picture',source_dimensions=[1920,1080],
    source_unique_frames=240,source_pose_rate=12,output=probe,
    native_intermediate='ProRes 4444',source_codec='H.264 CRF 12',final_codec='H.264 CRF 17',
    spatial_upscaling=False,post_denoising=False,motion_blur=False,depth_of_field=False,
    audio='Copied approved v3 AAC packets; no resynthesis, remix or reencoding',
    audio_packet_hash_before=before_audio,audio_packet_hash_after=after_audio,
    film_sha256=hashlib.sha256(film.read_bytes()).hexdigest())
(root/'quality-v4.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('KINBUILD_HD_COMPLETE',json.dumps(manifest),flush=True)
