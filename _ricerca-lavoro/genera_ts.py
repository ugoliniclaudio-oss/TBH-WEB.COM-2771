import json,re
V="2026-10-06"
def clean(s):
    if s is None: return None
    return re.sub(r'\s+',' ',s).strip().rstrip(',')
cpi=[]
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
for x in json.load(open('er-parsed.json')):
    comp=clean(x['competenza'])
    if comp:
        comp=re.sub(r"^Il Centro per l'impiego di .*? ha competenza sui territori comunali di ","",comp).rstrip('.')
    nota=None
    if x['nome']=='Riccione':
        nota="Avviso della fonte: chiuso al pubblico da lunedì 12 a venerdì 16 ottobre per trasferimento; da lunedì 19 ottobre nuova sede in Viale Puglia n. 1 (servizi telefonici e online mantenuti)."
    if not comp: nota=(nota+" " if nota else "")+"Sede decentrata: la fonte non riporta un elenco di comuni di competenza."
    cpi.append(dict(id="er-"+slug(x['nome']),regione="Emilia-Romagna",provincia=x['provincia'],nome="Centro per l'impiego — "+x['nome'],territorio=comp,indirizzo=clean(x['indirizzo']),telefono=clean(x['telefono']),email=x['email'].lower(),pagina=x['url'],fonte="Agenzia regionale per il lavoro Emilia-Romagna",verificato=V,nota=nota,stato="verificato"))
AB="https://selfi.regione.abruzzo.it/menu_items/centri-per-l-impiego"
for x in json.load(open('abruzzo-parsed.json')):
    n=x['nome'].replace('CPI ','')
    nota=("Sedi coordinate secondo la fonte: "+clean(x['sedi'])) if x.get('sedi') else None
    cpi.append(dict(id="abruzzo-"+slug(n),regione="Abruzzo",provincia=x['provincia'],nome="Centro per l'impiego — "+n,territorio=clean(x['competenza']),indirizzo=clean(x['indirizzo']),telefono=clean(x['telefono']),email=x['email'],pagina=AB,fonte="Regione Abruzzo — SELFI",verificato=V,nota=nota,stato="verificato"))
MA="https://www.regione.marche.it/Entra-in-Regione/Centri-Impiego/Dai-CPI"
for x in json.load(open('marche-parsed.json')):
    n=x['nome'].replace('Centro impiego ','')
    cpi.append(dict(id="marche-"+slug(n),regione="Marche",provincia=x['provincia'],nome="Centro per l'impiego — "+n,territorio=clean(x['competenza']),indirizzo=clean(x['indirizzo']).title() if x['indirizzo'] else None,telefono=clean(x['telefono']),email=x['email'],pagina=MA,fonte="Regione Marche — elenco Centri per l'impiego",verificato=V,nota=None,stato="verificato"))
for x in json.load(open('foggia-parsed.json')):
    n=x['nome'].replace("Centro per l'Impiego ","")
    cpi.append(dict(id="puglia-"+slug(n),regione="Puglia",provincia="Foggia",nome="Centro per l'impiego — "+n,territorio=clean(x['competenza']).replace(' ,',','),indirizzo=x['indirizzo'],telefono=x['telefono'],email=x['email'],pagina=x['url'],fonte="ARPAL Puglia",verificato=V,nota=None,stato="verificato"))
MO="https://www.garanziagiovani.molise.it/showpags.php?idpag=28"
for n,ind,tel,pec in [("Campobasso","Piazza Molise 65","0874/1958403","cpi.campobasso@pec.moliselavoro.it"),("Isernia","Via Berta (Provincia)","0865/252520","cpi.isernia@pec.moliselavoro.it"),("Termoli","Via Corsica 202","0875/478001","cpi.termoli@pec.moliselavoro.it")]:
    cpi.append(dict(id="molise-"+slug(n),regione="Molise",provincia="Campobasso" if n!="Isernia" else "Isernia",nome="Centro per l'impiego — "+n,territorio=None,indirizzo=ind,telefono=tel,email=pec,pagina=MO,fonte="Regione Molise — Garanzia Giovani",verificato=V,nota="Recapiti da pagina regionale non recente (PEC). Le pagine CPI di moliselavoro.it risultano non raggiungibili (errore 404) e il portale SIL Molise restituisce errore 500: riconfermare prima di recarsi in sede.",stato="da-riconfermare"))
# Federalberghi
web=json.load(open('federal-web.json'))
ESCLUDI={'http://www.cattolicahospitality.com','http://www.hotelsgenova.it','http://www.ischiahotels.it','http://www.toscanamare.com','http://www.chioggiahotel.it','http://www.eoliehotel.com/','http://www.taohotels.com'}
okmap={r['url']:r['final'] for r in web if r.get('status')==200 and r.get('len',0)>2000 and r['url'] not in ESCLUDI}
fed=[]
for x in json.load(open('federal-parsed.json')):
    s=x['sitoIndicato']; sito=okmap.get(s) if s else None
    if sito: sito=sito.rstrip('#')
    if x['territorio']=='Rimini': sito='https://rimini.federalberghi.it/index.aspx'
    fed.append(dict(id="fa-"+slug(x['territorio']),territorio=x['territorio'],nome=clean(x['nome']),regione=x['regione'],provincia=x['provincia'],indirizzo=clean(x['indirizzo']),telefono=x['telefono'],email=x['email'].strip(),sito=sito,verificato=V))
def ts(v): return json.dumps(v,ensure_ascii=False,indent=2)
out=f'''// Generato da _ricerca-lavoro/genera_ts.py — dati da fonti ufficiali, verificati il {V}.
// Non aggiungere a mano recapiti non verificati: aggiornare la fonte e rigenerare.
import type {{ AssociazioneAlberghi, CentroImpiego }} from "./fonti-lavoro";

export const CENTRI_IMPIEGO: CentroImpiego[] = {ts(cpi)};

export const ASSOCIAZIONI_FEDERALBERGHI: AssociazioneAlberghi[] = {ts(fed)};
'''
open('/home/user/tbh-web/packages/web/src/web/lib/fonti-lavoro-dati.ts','w').write(out)
print(len(cpi),len(fed),sum(1 for f in fed if f['sito']))
