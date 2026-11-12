import json,io,copy,sys,xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image
import cairosvg

def find(root,key,value):return next((e for e in root.iter() if e.get(key)==value),None)
def mask(root,target):
 if target is None:return None
 def keep(e):
  if e is target or e.tag.split('}')[-1]=='defs':return copy.deepcopy(e)
  out=ET.Element(e.tag,e.attrib)
  for child in e:
   part=keep(child)
   if part is not None:out.append(part)
  return out if len(out) else None
 return keep(root)
def bbox(root,node):
 e=mask(root,node)
 if e is None:return None
 _,_,w,h=map(float,root.get('viewBox').split());scale=3
 png=cairosvg.svg2png(bytestring=ET.tostring(e),output_width=round(w*scale),output_height=round(h*scale));im=Image.open(io.BytesIO(png));b=im.getchannel('A').point(lambda v:255 if v>128 else 0).getbbox()
 return tuple(v/scale for v in b) if b else None
def overlap(a,b):return a and b and min(a[2],b[2])>max(a[0],b[0]) and min(a[3],b[3])>max(a[1],b[1])

root=Path(sys.argv[1]);cases=json.loads((root/'contacts.json').read_text());fail=[];checks=0
for case in cases:
 try:
  e=ET.fromstring(case['svg']);name=case['name']
  if case['type']=='position':
   item=find(e,'data-scene-part','position-object');b=bbox(e,item);target=float(item.get('data-contact-y'));pos=item.get('data-position');ref=item.get('data-reference')
   if not b or abs(b[3]-target)>2:fail.append({'name':name,'error':'object misses declared support','bounds':b,'supportY':target})
   if pos=='under' and ref=='chair' and b[1]<130:fail.append({'name':name,'error':'object intersects chair seat','bounds':b})
   if pos=='under' and ref=='box' and b[1]<124:fail.append({'name':name,'error':'object intersects storage box','bounds':b})
   checks+=1
  elif case['type']=='actor':
   for arm in [n for n in e.iter() if n.get('data-scene-part') in ['action-arms','pushing-arms']]:
    b=bbox(e,arm)
    if b and b[2]-b[0]>95:fail.append({'name':name,'error':'overlong action arms','bounds':b})
    checks+=1
   for left,right in [('sleeping-head','pillow'),('seated-character','seat')]:
    a=find(e,'data-scene-part',left);b=find(e,'data-scene-part',right)
    if a is not None and b is not None:
     if not overlap(bbox(e,a),bbox(e,b)):fail.append({'name':name,'error':left+' has no supporting '+right})
     checks+=1
  elif case['type']=='world-sleep':
   if not overlap(bbox(e,find(e,'data-world-resting-head','true')),bbox(e,find(e,'data-world-pillow','true'))):fail.append({'name':name,'error':'world head misses pillow'})
   if not overlap(bbox(e,find(e,'data-world-duvet','true')),bbox(e,find(e,'data-world-pillow','true'))):fail.append({'name':name,'error':'world duvet misses pillow'})
   checks+=2
 except Exception as exc:fail.append({'name':case['name'],'error':str(exc)})
report={'cases':len(cases),'physicalGeometryChecks':checks,'failures':fail};(root/'contact-raster-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report));sys.exit(bool(fail))
