"""Package the completed Blender render, export the native edit, and master it.

Requires all 240 rendered source frames, the verified Tesseract CLI, FFmpeg,
and the previously imported voice, music and v3 rhythm assets. Fails rather
than rendering a partial sequence. Run with --tsrct /absolute/path/to/tsrct.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

parser = argparse.ArgumentParser()
parser.add_argument('--tsrct', required=True)
parser.add_argument('--master-only', action='store_true', help='Reuse the completed native export')
args = parser.parse_args()
ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
WORK = ROOT / '.tesseract-work/v3'
PREVIEWS = ROOT / 'Previews'
PROJECT = ROOT / 'Kinbuild.tsrct'
FRAMES = ROOT.parent / 'kinbuild-toykit/.tesseract-work/renders'
env = os.environ.copy()
env.setdefault('VK_ICD_FILENAMES', '/usr/lib/chromium/vk_swiftshader_icd.json')

def run(*command):
    print('RUN', command[0], command[1] if len(command)>1 else '', flush=True)
    return subprocess.run([str(x) for x in command], check=True, env=env)

def measure(path, output):
    result = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(path), '-vn',
        '-af', 'loudnorm=I=-15:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-'],
        check=True, capture_output=True, text=True)
    data = json.JSONDecoder().raw_decode(result.stderr[result.stderr.rfind('{'):])[0]
    output.write_text(json.dumps(data, indent=2)+'\n')
    return data

expected = [FRAMES/f'frame-{f:04d}.png' for f in range(1,481,2)]
assert all(p.exists() and p.stat().st_size>1000 for p in expected), '3D rendering is incomplete'
assert len(list(FRAMES.glob('frame-*.png'))) == 240, 'Unexpected source frame count'
approved = json.loads((WORK/'approved-voice.json').read_text())
voice = ROOT/'.tesseract-work/v2/narration-final.wav'
assert hashlib.sha256(voice.read_bytes()).hexdigest() == approved['sha256'], 'Approved voice changed'

if not args.master_only:
    footage = WORK/'toykit-3d.mp4'
    run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-framerate', '12',
        '-pattern_type', 'glob', '-i', str(FRAMES/'frame-*.png'), '-vf', 'hqdn3d=2:1.5:2:1.5,fps=24',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', '-an', footage)
    run(args.tsrct, 'project', 'import-video', '--project', PROJECT, '--file', footage, '--asset-id', 'toykit-3d-v3')
    run(sys.executable, ROOT/'author_toykit.py')
    run(args.tsrct, 'project', 'commit', '--project', PROJECT, '--file', WORK/'film-editable.json')
    run(args.tsrct, 'project', 'apply', '--project', PROJECT, '--actions', WORK/'film-actions.json')
    run(args.tsrct, 'filmstrip', '--project', PROJECT, '--timestamps-ms',
        '0,1500,3200,4200,6200,8300,11000,13000,15500,16750,18000,19500',
        '--tile-width', '320', '--tile-height', '180', '--items-per-row', '4',
        '--output', PREVIEWS/'filmstrip-v3.png')
    run(args.tsrct, 'export', '--project', PROJECT, '--output', WORK/'native-export.mp4',
        '--resolution', '1080p', '--fps', '24', '--encoder-backend', 'external-ffmpeg-command',
        '--ffmpeg-path', '/usr/bin/ffmpeg')

first = measure(WORK/'native-export.mp4', WORK/'native-loudness.json')
audio_filter = ('loudnorm=I=-15:TP=-1.5:LRA=9:'
    f"measured_I={first['input_i']}:measured_TP={first['input_tp']}:"
    f"measured_LRA={first['input_lra']}:measured_thresh={first['input_thresh']}:"
    f"offset={first['target_offset']}:linear=true")
film = ROOT/'Kinbuild-film.mp4'
run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', WORK/'native-export.mp4',
    '-af', audio_filter, '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-movflags', '+faststart', '-t', '20', film)
final = measure(film, PREVIEWS/'audio-final-v3.json')
assert -16 <= float(final['input_i']) <= -14, final
assert float(final['input_tp']) <= -1, final
(ROOT/'mastering-v3.json').write_text(json.dumps(dict(
    input='Native Tesseract toy-kit export', target=dict(integrated_lufs=-15,true_peak_dbtp=-1.5,lra=9),
    pass_one=first, pass_two_filter=audio_filter, final_encoded=final,
    approved_narration=approved, output='1280x720, 24 fps, H.264 CRF 22, AAC 192 kb/s 48 kHz stereo'), indent=2)+'\n')
shutil.copyfile(film, REPO/'public/media/kinbuild-film.mp4')
shutil.copyfile(film, REPO/'artifacts/Kinbuild-film-v3.mp4')
run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '18.6', '-i', film,
    '-frames:v', '1', '-q:v', '85', REPO/'public/media/kinbuild-poster.webp')
print('KINBUILD_V3_MASTER_COMPLETE', json.dumps(final), flush=True)
