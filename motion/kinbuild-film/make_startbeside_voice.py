from pathlib import Path
import json,subprocess
import numpy as np
import soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro
root=Path(__file__).resolve().parent/'.tesseract-work/startbeside'
root.mkdir(parents=True,exist_ok=True)
old=root.parent/'v2'
toolroot=Path('/workspace/.tools/kinbuild-film')
ort.disable_telemetry_events()
options=ort.SessionOptions(); options.intra_op_num_threads=4; options.inter_op_num_threads=2
session=ort.InferenceSession(str(toolroot/'kokoro-v1.0.onnx'),sess_options=options,providers=['CPUExecutionProvider'])
voice=Kokoro.from_session(session,str(toolroot/'voices-v1.0.bin'))
final,rate=sf.read(old/'narration-final.wav')
cues=json.loads((old/'narration-cues.json').read_text())
for i,start,text,limit in [(2,5.75,'At Start beside, find your people, and turn that first idea into a real startup.',11.5),(4,16.65,"Start beside. Don't build alone.",20)]:
 samples,sr=voice.create(text,voice='af_heart',speed=.90,lang='en-us')
 n=min(120,len(samples)//2);samples[:n]*=np.linspace(0,1,n);samples[-n:]*=np.linspace(1,0,n)
 end=start+len(samples)/sr
 assert end<limit,(i,end,limit)
 sf.write(root/f'voice-{i}.wav',samples,sr)
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/f'voice-{i}.wav'),'-af','highpass=f=70,pan=stereo|c0=0.70710678*c0|c1=0.70710678*c0,acompressor=threshold=0.1:ratio=2:attack=10:release=100:makeup=1,volume=5.67dB,alimiter=limit=0.707946:level=false:latency=true','-ar',str(rate),'-c:a','pcm_s24le',str(root/f'voice-{i}-prepared.wav')],check=True)
 prepared,_=sf.read(root/f'voice-{i}-prepared.wav')
 # Replace complete thoughts at existing silence boundaries, preserving phrases 1 and 3.
 a=round(start*rate);b=round(limit*rate)
 final[a:b]=0;final[a:a+len(prepared)]=prepared
 cues['cues'][i-1].update(text=text.replace('Start beside','StartBeside'),start=start,end=round(end,3),file=f'voice-{i}.wav')
 print(i,start,end,flush=True)
sf.write(root/'narration-final.wav',final,rate,subtype='PCM_24')
cues['revision']='StartBeside: only complete thoughts 2 and 4 regenerated; original processed thoughts 1 and 3 preserved; no time stretching.'
cues['audition']='Not listening-confirmed; waveform and loudness verification only.'
(root/'narration-cues.json').write_text(json.dumps(cues,indent=2)+'\n')
