import json,sys,re
sys.path.insert(0,'_ricerca-lavoro')
from rl import load
PROV={'ferrara':'Ferrara','bologna':'Bologna','forli-cesena':'Forlì-Cesena','parma':'Parma','modena':'Modena','piacenza':'Piacenza','reggio-emilia':'Reggio Emilia','ravenna':'Ravenna','rimini':'Rimini'}
def m(p,b):
  r=re.search(p,b,re.S|re.I); return r.group(1).strip() if r else None
out=[]
for nome,u in json.load(open('_ricerca-lavoro/er-cpi.json')):
  t=load(u)['text']
  b=t.split('Vedi azioni Stampa Invia',1)[-1].split('Ultimo aggiornamento')[0]
  ind=m(r'Indirizzo (.*?)(?: Orario| Ultimo|$)',b)
  if ind and ind.startswith(nome): ind=ind[len(nome):].strip()
  if ind: ind=re.sub(r'\s+-\s*Italia.*$','',ind); ind=re.sub(r'\s+-\s*$','',ind)
  comp=m(r'(?:Competenza territoriale|Territorio di competenza) (.*?)(?: Responsabile| Contatti| Indirizzo|$)',b)
  tel=m(r'Telefono\s*:\s*([0-9][0-9 ./]+[0-9])',b)
  ms=re.findall(r'E-?mail\s*:\s*(\S+@[\w.-]+\w)',b,re.I); mail=next((x for x in ms if x.lower().startswith('impiego')),ms[0] if ms else None)
  out.append(dict(nome=nome,provincia=PROV[u.split('/sedi-')[1].split('/')[0]],url=u,indirizzo=ind,competenza=comp,telefono=tel,email=mail))
json.dump(out,open('_ricerca-lavoro/er-parsed.json','w'),ensure_ascii=False,indent=1)
for o in out:
  if not all([o['indirizzo'],o['telefono'],o['email']]): print('MANCA',o)
print(len(out))
