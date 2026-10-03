"""Split public/images/startbeside-arch.webp into its three stones (left block,
right column, top beam) for the "Find your missing piece" section.
Run from the repository root: python3 scripts/split-arch.py (needs numpy, pillow, scipy).
"""
from PIL import Image; import numpy as np
from scipy import ndimage
src=Image.open('public/images/startbeside-arch.webp').convert('RGBA'); W,H=src.size
arr=np.asarray(src).astype(float)
lum=ndimage.median_filter(arr[...,:3]@[0.299,0.587,0.114],size=5); a=arr[...,3]
lum[a<60]=0
rgb=ndimage.median_filter(arr[...,:3],size=(5,5,1))
warm=(rgb[...,0]-rgb[...,2])/(rgb.sum(2)/3+1)
pil=np.where(np.arange(W)[None,:]<690, (warm>0.15)|(lum>165), lum>135)&(a>128)
bound=np.full(W,575.0)
for x in range(W):
    c=pil[380:620,x]
    for i in range(len(c)-8):
        if c[i:i+8].all(): bound[x]=380+i; break
gap=(np.arange(W)>560)&(np.arange(W)<820); bound[gap]=575
bound=ndimage.median_filter(bound,size=9)
yy=np.arange(H)[:,None]; xx=np.arange(W)[None,:]
pillar=yy>=bound[None,:]
left=pillar&(xx<690)
darkband=(lum<80)&(yy<530)&left
left=left&~darkband
left=ndimage.binary_opening(left,iterations=2)
right=pillar&(xx>=690)
# Below the beam, between the pillars, keep nothing: only faint floor shading lives there.
beam_end=np.full(W,H)
for x in range(W):
    col=a[380:,x]; idx=np.where(col<90)[0]
    beam_end[x]=380+(idx[0] if len(idx) else 0)
beam_end=ndimage.median_filter(beam_end,size=9)
below=(yy>=beam_end[None,:])&~left&~right
left=left; top=ndimage.binary_dilation(~(left|right),iterations=3)&~below&(yy<bound[None,:]+4)
for n,m in (('left',left),('right',right),('top',top)):
    soft=ndimage.gaussian_filter(m.astype(float),0.6)
    out=arr.copy(); out[...,3]=a*soft
    im=Image.fromarray(out.clip(0,255).astype(np.uint8)); print(n, im.getbbox())
    im.resize((1000,1000),Image.LANCZOS).save(f'public/images/arch-{n}.webp',quality=84,method=6)
