import json,io,math,os,sys,xml.etree.ElementTree as ET,hashlib
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
from PIL import Image
import cairosvg

DIST=Path(os.environ.get('APP_DIST',Path(__file__).resolve().parent.parent/'dist'))
def expand_images(e):
 for parent in list(e.iter()):
  for i,child in enumerate(list(parent)):
   if child.tag.split('}')[-1]!='image':continue
   href=child.get('href') or child.get('{http://www.w3.org/1999/xlink}href')
   if not href or href.startswith(('http:','https:','data:')):raise ValueError('Unexpected image href '+str(href))
   file=DIST/href.split('?')[0]
   if not file.is_file():raise ValueError('Missing referenced image '+str(file))
   art=ET.fromstring(file.read_text());expand_images(art)
   for k in ['x','y','width','height','transform']: 
    if child.get(k) is not None:art.set(k,child.get(k))
   parent.remove(child);parent.insert(i,art)
 return e

def check(a):
 try:
  svg=a['svg'];e=expand_images(ET.fromstring(svg));svg=ET.tostring(e);vb=list(map(float,e.attrib.get('viewBox','0 0 120 120').split()));w,h=vb[2:];scale=min(192/max(w,h),1);png=cairosvg.svg2png(bytestring=svg,output_width=max(16,round(w*scale)),output_height=max(16,round(h*scale)));im=Image.open(io.BytesIO(png)).convert('RGBA');box=im.getchannel('A').point(lambda x:255 if x>32 else 0).getbbox()
  if not box:return {'label':a['label'],'error':'blank raster'}
  if a['label'].startswith('vocabulary-'):
   e.set('viewBox','-12 -12 264 264');padded=Image.open(io.BytesIO(cairosvg.svg2png(bytestring=ET.tostring(e),output_width=264,output_height=264))).convert('RGBA');bounds=padded.getchannel('A').point(lambda v:255 if v>64 else 0).getbbox()
   if bounds and (bounds[0]<12 or bounds[1]<12 or bounds[2]>252 or bounds[3]>252):return {'label':a['label'],'error':'ink outside canvas','bounds':bounds}
  return None
 except Exception as e:return {'label':a['label'],'error':str(e)}

if __name__=='__main__':
 root=Path(sys.argv[1]);items=[json.loads(l) for l in (root/'activity-art.ndjson').read_text().splitlines()];fail=[];done=0
 with ProcessPoolExecutor(max_workers=4) as pool:
  for r in pool.map(check,items,chunksize=16):
   done+=1
   if r:fail.append(r)
   if done%1500==0:print(json.dumps({'rasterChecked':done,'total':len(items),'failures':len(fail)}),flush=True)
 report={'rendered':done,'invalidOrBlank':fail};(root/'raster-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True)
 if fail:sys.exit(1)
