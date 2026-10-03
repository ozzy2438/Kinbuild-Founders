"""Add a little rhythmic lift to the approved score; preserve its existing stems.

The narrator, melody, harmonies and tempo remain the exact approved v2 sources.
"""
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter,sosfilt

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'.tesseract-work/v3'
OUT.mkdir(exist_ok=True,parents=True)
sr=48000;n=20*sr;beat=.515625;rng=np.random.default_rng(3842)
rhythm=np.zeros((n,2));foley=np.zeros((n,2))
def filt(a,hz,kind):return sosfilt(butter(2,hz,fs=sr,btype=kind,output='sos'),a)
def place(bus,a,start,gain,pan=0):
    p=round(start*sr);length=min(len(a),n-p)
    if length<=0:return
    theta=(pan+1)*np.pi/4
    bus[p:p+length,0]+=a[:length]*gain*np.cos(theta)
    bus[p:p+length,1]+=a[:length]*gain*np.sin(theta)
def shaker():
    t=np.arange(round(.065*sr))/sr
    return filt(filt(rng.normal(size=len(t)),8500,'lowpass'),4700,'highpass')*np.exp(-t/.018)*np.minimum(t/.002,1)
def clap():
    t=np.arange(round(.15*sr))/sr
    noise=filt(filt(rng.normal(size=len(t)),5500,'lowpass'),1200,'highpass')
    env=np.exp(-t/.023)
    for delay,vol in [(.013,.62),(.025,.38)]:env+=np.where(t>=delay,vol*np.exp(-np.maximum(0,t-delay)/.025),0)
    return noise*env*np.minimum(t/.001,1)
def kick():
    t=np.arange(round(.25*sr))/sr
    phase=2*np.pi*(56*t+48*.023*(1-np.exp(-t/.023)))
    return np.sin(phase)*np.exp(-t/.078)*np.minimum(t/.0015,1)
def click():
    t=np.arange(round(.09*sr))/sr
    tone=(np.sin(2*np.pi*510*t)+.45*np.sin(2*np.pi*1060*t))*np.exp(-t/.013)
    return tone*np.minimum(t/.001,1)

# Sixteenth-note texture adds motion without changing the familiar tune or tempo.
for bar in range(1,10):
    st=bar*4*beat
    for step in range(16):
        when=st+step*.25*beat+(.007 if step%2 else 0)
        if when>19.0:continue
        accent=[1,.43,.64,.50][step%4]
        gain=.037*accent*(.6 if bar<2 else 1)*(1+rng.uniform(-.08,.08))
        place(rhythm,shaker(),when,gain,-.4 if step%2 else .4)
    if 2<=bar<8:
        place(rhythm,clap(),st+2*beat,.037)
        place(rhythm,kick(),st+2*beat,.063)
        # A light pickup before the next construction beat.
        place(rhythm,clap(),st+3.75*beat,.011)

# Sparse tactile accents at a few real assembly arrivals, rather than every part.
for t,gain in [(2.45,.030),(4.53,.024),(5.33,.025),(6.35,.022),(8.25,.025),(10.41,.020),(13.15,.022),(14.79,.020),(15.62,.024),(16.36,.040)]:
    place(foley,click(),t,gain,0)
time=np.arange(n)/sr
envelope=np.clip(np.minimum(time/.06,(20-time)/.75),0,1)
rhythm*=envelope[:,None];foley*=envelope[:,None]
sf.write(OUT/'music-momentum.wav',rhythm,sr,subtype='PCM_16')
sf.write(OUT/'toy-connections.wav',foley,sr,subtype='PCM_16')
print('Preserved five approved stems; added rhythm and tactile assembly tracks.')
