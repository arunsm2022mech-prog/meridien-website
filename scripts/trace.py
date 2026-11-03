import cv2, numpy as np, sys
src=sys.argv[1]
im=cv2.imread(src)
im=cv2.resize(im,(1600,1600),interpolation=cv2.INTER_LANCZOS4)
b,g,r=[im[:,:,i].astype(int) for i in range(3)]
navy=((b>40)&(r<60)&(g<70)).astype(np.uint8)*255
orange=((r>180)&(g<160)&(b<110)).astype(np.uint8)*255
def paths(mask,smooth=0):
    mask=cv2.GaussianBlur(mask,(21,21),0); _,mask=cv2.threshold(mask,127,255,0)
    cs,h=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    out=[]
    for c in cs:
        if cv2.contourArea(c)<400: continue
        if smooth:
            pts0=c[:,0,:].astype(float); k=smooth; n0=len(pts0)
            ext=np.vstack([pts0[-k:],pts0,pts0[:k]])
            ker=np.ones(2*k+1)/(2*k+1)
            sm=np.stack([np.convolve(ext[:,j],ker,'valid') for j in range(2)],1)
            c=sm.reshape(-1,1,2).astype(np.float32)
        c=cv2.approxPolyDP(c,2.5,True)
        pts=c[:,0,:]/8.0
        n=len(pts); mids=[(pts[i]+pts[(i+1)%n])/2 for i in range(n)]
        d=f'M{mids[-1][0]:.2f} {mids[-1][1]:.2f}'
        for i in range(n): d+=f' Q{pts[i][0]:.2f} {pts[i][1]:.2f} {mids[i][0]:.2f} {mids[i][1]:.2f}'
        out.append(d+'Z')
    return ' '.join(out)
pn=paths(navy,18); po=paths(orange)
print('NAVY_LEN',len(pn),'OR_LEN',len(po))
ys,xs=np.where(orange>0); print('orange bbox',xs.min()/8,ys.min()/8,xs.max()/8,ys.max()/8)
print('orange color', np.median(im[orange>0],axis=0)[::-1])
open('public/m-mark.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="#051143" fill-rule="evenodd" d="{pn}"/><path fill="#F4601C" d="{po}"/></svg>')
open('scripts/paths.txt','w').write(pn+'\n'+po)
