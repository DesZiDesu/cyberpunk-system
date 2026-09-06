from pathlib import Path
import re,json,sys
if len(sys.argv) != 2: raise SystemExit('Usage: python scripts/build-catalog.py /path/to/agis-all-game-items-store')
root=Path(sys.argv[1]).resolve()/'src'; entries={}
for folder in ['A.G.I.S. - PUBLICNET','A.G.I.S. - BLACKWALL']:
 for p in sorted((root/folder).rglob('*store.reds')):
  s=p.read_text(); path=str(p).lower(); category='item'
  for token,cat in [('outfit','clothing'),('ranged','weapons'),('melee','weapons'),('cyberware','cyberware'),('_cw_','cyberware'),('hacks','quickhack'),('mods','mod'),('attachments','mod'),('materials','component'),('ammo','component'),('meds','consumable'),('food','consumable'),('drinks','consumable'),('skillbooks','data'),('recipes','data')]:
   if token in path: category=cat
  for ident in re.findall(r'"(Items\.[A-Za-z0-9_]+)"',s):
   entries.setdefault(ident,{'id':ident,'name':ident.removeprefix('Items.').replace('_',' '),'category':category,'technical':True})
curated=[]
for category,names in {'cyberware':['Gorilla Arms','Mantis Blades','Monowire','Projectile Launch System','Kiroshi Optics','Reinforced Tendons','Fortified Ankles','Biomonitor','Blood Pump','Second Heart','Subdermal Armor','Optical Camo','Sandevistan','Berserk','Cyberdeck','EX-Disk','Memory Boost','Kerenzikov','Neofiber','Bionic Joints','Titanium Bones','Smart Link','Ballistic Coprocessor'],'quickhack':['Short Circuit','Overheat','Contagion','Cyberware Malfunction','Reboot Optics','Ping','Memory Wipe','Sonic Shock','Weapon Glitch','System Collapse'],'weapons':['Unity','Lexington','Nue','Overture','Copperhead','Masamune','Ajax','Kyubi','Carnage','Crusher','Tactician','Satara','Defender','Pulsar','Saratoga','Nekomata','Grad','Ashura','Katana','Kukri','Baseball Bat','Erebus'],'consumable':['MaxDoc','Bounce Back'],'data':['Encrypted shard']}.items():
 for name in names:
  x={'id':'cps:'+name.lower().replace(' ','-'),'name':name,'category':category,'curated':True}
  if category=='cyberware':
   x['slot']='arms' if name in ['Gorilla Arms','Mantis Blades','Monowire','Projectile Launch System'] else 'legs' if name in ['Reinforced Tendons','Fortified Ankles'] else 'operating-system' if name in ['Sandevistan','Berserk','Cyberdeck'] else name.lower().replace(' ','-')
   groups={'Kiroshi Optics':'face','Biomonitor':'circulatory-system','Blood Pump':'circulatory-system','Second Heart':'circulatory-system','Subdermal Armor':'integumentary-system','Optical Camo':'integumentary-system','EX-Disk':'frontal-cortex','Memory Boost':'frontal-cortex','Kerenzikov':'nervous-system','Neofiber':'nervous-system','Bionic Joints':'skeleton','Titanium Bones':'skeleton','Smart Link':'hands','Ballistic Coprocessor':'hands'}
   x['slot']=groups.get(name,x['slot'])
   x['capacity']=15
  curated.append(x)
districts=[{'id':'watson','name':'Watson','x':37,'y':20,'areas':['Little China','Kabuki','Northside','Arasaka Waterfront']},{'id':'westbrook','name':'Westbrook','x':68,'y':36,'areas':['Japantown','Charter Hill','North Oak']},{'id':'city-center','name':'City Center','x':35,'y':42,'areas':['Corpo Plaza','Downtown']},{'id':'heywood','name':'Heywood','x':36,'y':61,'areas':['Wellsprings','The Glen','Vista del Rey']},{'id':'santo-domingo','name':'Santo Domingo','x':69,'y':64,'areas':['Arroyo','Rancho Coronado']},{'id':'pacifica','name':'Pacifica','x':34,'y':82,'areas':['Coastview','West Wind Estate','Dogtown']},{'id':'badlands','name':'Badlands','x':86,'y':86,'areas':['Northern Badlands','Eastern Badlands','Southern Badlands']}]
out=Path(__file__).resolve().parent.parent
(out/'rpg-catalog.js').write_text('/* Factual item IDs from AGIS source snapshot 103a6250; see SOURCES.md. Technical labels are not verified display names. */\nglobalThis.CyberpunkCatalog = '+json.dumps({'version':1,'curated':curated,'records':list(entries.values()),'districts':districts},ensure_ascii=False,separators=(',',':'))+';\n')
print({'curated':len(curated),'technicalIDs':len(entries)})
