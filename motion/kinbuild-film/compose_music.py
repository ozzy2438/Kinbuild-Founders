"""Original Kinbuild instrumental: warm keys, evolving pads, pulse, bass, drums.

No external recording or sample library. Reproducible synthesis and editable MIDI.
The final F-major arrival is at 16.5 s, the existing film's closing reveal.
"""
from pathlib import Path
import json
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt
import mido

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'.tesseract-work/v2'
OUT.mkdir(parents=True,exist_ok=True)
SR=48000
DURATION=20
BEAT=.515625
BPM=60/BEAT
N=SR*DURATION
RNG=np.random.default_rng(2438)
stems={k:np.zeros((N,2),dtype=np.float64) for k in ['keys','pad','pulse','bass','drums']}
events=[]

def hz(note): return 440*2**((note-69)/12)
def low(signal,freq): return sosfilt(butter(2,freq,fs=SR,output='sos'),signal)
def high(signal,freq): return sosfilt(butter(2,freq,fs=SR,btype='highpass',output='sos'),signal)

def place(stem,signal,start,amp=1,pan=0):
    index=round(start*SR)
    if index>=N: return
    if index<0: signal=signal[-index:]; index=0
    length=min(len(signal),N-index)
    angle=(pan+1)*np.pi/4
    stems[stem][index:index+length,0]+=signal[:length]*amp*np.cos(angle)
    stems[stem][index:index+length,1]+=signal[:length]*amp*np.sin(angle)

def key(note,length,velocity=1):
    t=np.arange(round(length*SR))/SR
    f=hz(note)
    # A warm tine-like electric piano, with a rounded attack and decaying overtones.
    fm=.65*np.exp(-t/1.2)*np.sin(2*np.pi*f*2*t)
    signal=np.sin(2*np.pi*f*t+fm)*np.exp(-t/1.65)
    signal+=.12*np.sin(2*np.pi*f*3.004*t)*np.exp(-t/.5)
    signal+=.06*np.sin(2*np.pi*f*5.003*t)*np.exp(-t/.18)
    signal*=np.minimum(t/.012,1)*np.minimum((length-t)/.12,1)
    return low(signal,4800)*velocity

def pad(note,length):
    t=np.arange(round(length*SR))/SR
    f=hz(note)
    sig=np.zeros(len(t))
    for detune in [-.0017,0,.0019]:
        for harmonic,amp in [(1,.45),(2,.18),(3,.065),(4,.025)]:
            sig+=amp*np.sin(2*np.pi*f*(1+detune)*harmonic*t+harmonic*.4)
    env=np.minimum(t/.8,1)*np.minimum((length-t)/1.2,1)
    return low(sig,1800)*env*(.93+.07*np.sin(2*np.pi*.25*t))

def pluck(note,length):
    t=np.arange(round(length*SR))/SR
    f=hz(note)
    sig=np.sin(2*np.pi*f*t+1.1*np.exp(-t/.10)*np.sin(2*np.pi*2*f*t))
    return low(sig,3600)*np.exp(-t/.19)*np.minimum(t/.004,1)*np.minimum((length-t)/.05,1)

def bass(note,length):
    t=np.arange(round(length*SR))/SR
    f=hz(note)
    sig=np.sin(2*np.pi*f*t)+.24*np.sin(2*np.pi*2*f*t)+.1*np.sin(2*np.pi*3*f*t)
    return low(sig,700)*np.minimum(t/.014,1)*np.minimum((length-t)/.09,1)*np.exp(-t/1.8)

def kick():
    t=np.arange(round(.42*SR))/SR
    phase=2*np.pi*(49*t+65*.026*(1-np.exp(-t/.026)))
    return (np.sin(phase)*np.exp(-t/.115)+.13*np.sin(2*phase)*np.exp(-t/.055))*np.minimum(t/.0015,1)

def snare():
    t=np.arange(round(.27*SR))/SR
    noise=low(high(RNG.normal(size=len(t)),1250),7400)
    body=np.sin(2*np.pi*180*t)*np.exp(-t/.046)+.4*np.sin(2*np.pi*330*t)*np.exp(-t/.03)
    return (.32*noise*np.exp(-t/.043)+.22*body)*np.minimum(t/.001,1)

def hat(opened=False):
    length=.19 if opened else .09
    t=np.arange(round(length*SR))/SR
    sig=high(low(RNG.normal(size=len(t)),10500),6200)
    return sig*np.exp(-t/(.047 if opened else .014))*np.minimum(t/.001,1)

def note(stem,pitch,start,length,velocity,pan=0):
    sound={'keys':key,'pad':pad,'pulse':pluck,'bass':bass}[stem](pitch,length)
    place(stem,sound,start,velocity,pan)
    events.append(dict(stem=stem,note=pitch,time=round(start,4),duration=round(length,4),velocity=round(min(1,velocity)*110)))

# Voiced as a coherent phrase: Dm(add9), Bbmaj7, F(add9), C(add9), Fmaj9.
chords=[(0,[50,57,60,64],38),(4.125,[46,53,57,62],34),
        (8.25,[53,57,60,67],41),(12.375,[48,55,60,64],36),
        (16.5,[53,57,60,64,67],41)]
for number,(start,tones,root) in enumerate(chords):
    length=min(5.15,DURATION-start)
    for j,pitch in enumerate(tones):
        note('keys',pitch,start+.028*j, min(4.0,DURATION-start-.028*j),.18*(1+.08*RNG.normal()),(j/(len(tones)-1)-.5)*.8)
        note('pad',pitch,start,length,.049 if number<2 else .064,(j/(len(tones)-1)-.5)*1.1)
    if number<4:
        # A small rising answer to the chord, with rests for the voice.
        for offset,pitch,vel in [(2*BEAT,tones[2]+12,.095),(3*BEAT,tones[-1]+12,.073),(5*BEAT,tones[1]+12,.072)]:
            note('keys',pitch,start+offset,1.9,vel,.2 if pitch%2 else -.2)
    else:
        note('keys',72,18.62,1.38,.16,.15)
        note('keys',77,19.05,.95,.105,-.12)

# The groove grows after the first phrase; a full pulse arrives with Meet/Match.
for bar in range(2,8):
    st=bar*4*BEAT
    ci=min(bar//2,3)
    tones=chords[ci][1]
    root=chords[ci][2]
    energy=.7 if bar<4 else 1
    for step,length in [(0,1.5),(2,1.35),(3.5,.45)]:
        note('bass',root if step<3 else root+12,st+step*BEAT,length*BEAT,.22*energy)
    for step,velocity in [(0,.27),(1.5,.14),(2.75,.19)]:
        place('drums',kick(),st+step*BEAT,velocity*energy)
    place('drums',snare(),st+2*BEAT,.30*energy,-.05)
    for eighth in range(8):
        when=st+eighth*.5*BEAT+(.011 if eighth%2 else 0)
        place('drums',hat(eighth==7),when,(.058 if eighth%2==0 else .041)*energy,.28)
    if bar>=4:
        pattern=[0,2,1,3,2,1,3,2]
        for eighth,degree in enumerate(pattern):
            when=st+eighth*.5*BEAT+(.008 if eighth%2 else 0)
            note('pulse',tones[degree]+12,when,.55,.085*(1+.10*RNG.normal()),-.36 if eighth%2 else .36)

# Final arrival: one low pulse, a tonal bloom, then a clean musical release.
note('bass',41,16.5,2.4,.30)
place('drums',kick(),16.5,.30)
for offset,pitch in [(0,65),(.5*BEAT,69),(BEAT,72),(1.5*BEAT,76)]:
    note('pulse',pitch,16.5+offset,1.3,.06,(-.3 if pitch%2 else .3))

# Stereo reflections: diffuse tails rather than a distracting hall on the voice.
def space(signal,wet):
    result=signal.copy()
    for delay,gain in [(0.079,.30),(.127,.22),(.193,.18),(.283,.12),(.389,.085),(.511,.055)]:
        d=round(delay*SR)
        result[d:]+=signal[:-d,::-1]*gain*wet
    return result

for name in stems:
    stems[name]=space(stems[name],.65 if name in ['keys','pad'] else .22 if name=='pulse' else .04)
    fade=np.minimum(np.arange(N)/SR/.045,1)*np.minimum((DURATION-np.arange(N)/SR)/.9,1)
    stems[name]*=np.clip(fade,0,1)[:,None]
    sf.write(OUT/f'music-{name}-raw.wav',stems[name],SR,subtype='PCM_24')
mix=sum(stems.values())
sf.write(OUT/'music-original.wav',mix,SR,subtype='PCM_24')

# MIDI is an editable musical sketch; WAVs retain the authored timbres and effects.
mid=mido.MidiFile(ticks_per_beat=480)
tempo=mido.bpm2tempo(BPM)
for channel,name in enumerate(stems):
    track=mido.MidiTrack(); mid.tracks.append(track)
    track.append(mido.MetaMessage('track_name',name=name,time=0))
    if channel==0: track.append(mido.MetaMessage('set_tempo',tempo=tempo,time=0))
    program={'keys':4,'pad':89,'pulse':10,'bass':38,'drums':0}[name]
    track.append(mido.Message('program_change',channel=channel,program=program,time=0))
    ticks=[]
    for e in events:
        if e['stem']!=name: continue
        on=round(e['time']/BEAT*480)
        off=round((e['time']+e['duration'])/BEAT*480)
        ticks.extend([(on,mido.Message('note_on',channel=channel,note=e['note'],velocity=max(1,e['velocity']))),
                      (off,mido.Message('note_off',channel=channel,note=e['note'],velocity=0))])
    previous=0
    for tick,event in sorted(ticks,key=lambda pair:pair[0]):
        event.time=tick-previous; previous=tick; track.append(event)
mid.save(ROOT/'Kinbuild-score.mid')
(OUT/'music-score.json').write_text(json.dumps(dict(title='A Shared Beginning',composer='Original composition for Kinbuild',duration=20,bpm=BPM,seed=2438,chords=chords,notes=events),indent=2)+'\n')
print(json.dumps(dict(duration=DURATION,bpm=BPM,notes=len(events),stems=list(stems),peak=float(np.max(np.abs(mix))))))
