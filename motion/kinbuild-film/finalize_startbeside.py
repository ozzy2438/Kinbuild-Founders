"""Finish the StartBeside native ProRes export; retain the previous source revisions."""
import json,shutil,subprocess
from pathlib import Path
root=Path(__file__).resolve().parent
repo=root.parent.parent
work=root/'.tesseract-work/startbeside'
def run(*args):
 subprocess.run([str(x) for x in args],check=True)
def measure(path):
 r=subprocess.run(['ffmpeg','-hide_banner','-i',str(path),'-vn','-af','loudnorm=I=-15:TP=-1.5:LRA=9:print_format=json','-f','null','-'],check=True,capture_output=True,text=True)
 return json.JSONDecoder().raw_decode(r.stderr[r.stderr.rfind('{'):])[0]
native=work/'native-export.mov'
first=measure(native)
filt=('loudnorm=I=-15:TP=-1.5:LRA=9:'+f"measured_I={first['input_i']}:measured_TP={first['input_tp']}:measured_LRA={first['input_lra']}:measured_thresh={first['input_thresh']}:offset={first['target_offset']}:linear=true")
film=root/'StartBeside-film.mp4'
run('ffmpeg','-v','error','-y','-i',native,'-af',filt,'-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart','-t','20',film)
final=measure(film)
assert -16<=float(final['input_i'])<=-14,final
assert float(final['input_tp'])<=-1,final
(root/'mastering-startbeside.json').write_text(json.dumps(dict(cli='0.3.1',pass_one=first,pass_two_filter=filt,final_encoded=final,output='1920x1080, 24 fps, H.264 CRF 17, AAC 192k stereo',audition='Waveform and technical checks only; not listening-confirmed'),indent=2)+'\n')
shutil.copyfile(film,repo/'public/media/startbeside-film.mp4')
shutil.copyfile(film,repo/'artifacts/StartBeside-film.mp4')
shutil.copyfile(work/'narration-cues.json',root/'narration-cues-startbeside.json')
for seconds,name in [('18.6','poster'),('7.4167','team')]:
 run('ffmpeg','-v','error','-y','-ss',seconds,'-i',film,'-frames:v','1','-q:v','95',repo/f'public/media/startbeside-{name}.webp')
print(json.dumps(final),flush=True)
