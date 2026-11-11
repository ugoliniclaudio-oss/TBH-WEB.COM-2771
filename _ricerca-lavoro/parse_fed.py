import json,re
R={}
def add(reg,codes):
    for c in codes.split(): R[c]=reg
add("Piemonte","AL AT BI CN NO TO VB VC")
add("Valle d'Aosta","AO")
add("Lombardia","BG BS CO CR LC LO MN MI MB PV SO VA")
add("Trentino-Alto Adige","BZ TN")
add("Veneto","BL PD RO TV VE VR VI")
add("Friuli-Venezia Giulia","GO PN TS UD")
add("Liguria","GE IM SP SV")
add("Emilia-Romagna","BO FE FC MO PR PC RA RE RN")
add("Toscana","AR FI GR LI LU MS PI PT PO SI")
add("Umbria","PG TR")
add("Marche","AN AP FM MC PU")
add("Lazio","FR LT RI RM VT")
add("Abruzzo","AQ CH PE TE")
add("Molise","CB IS")
add("Campania","AV BN CE NA SA")
add("Puglia","BA BT BR FG LE TA")
add("Basilicata","MT PZ")
add("Calabria","CZ CS KR RC VV")
add("Sicilia","AG CL CT EN ME PA RG SR TP")
add("Sardegna","CA NU OR SS SU")
raw=json.load(open('federal-raw.json'))
out=[];bad=[]
for o in raw:
    parts=o['h'].split(' | ')
    terr=parts[0]; nome=parts[1] if len(parts)>1 else parts[0]
    lines=o['txt'].split('\n')
    addr=lines[0]
    m=re.findall(r'\(([A-Z]{2})\)',o['txt'])
    prov=m[0] if m else None
    tel=None
    mt=re.search(r'telefono\s*(\+39[\d \/\.]*\d)',o['txt'])
    if mt: tel=mt.group(1).strip()
    email=next((l[7:] for l in o['links'] if l and l.startswith('mailto:')),None)
    web=next((l for l in o['links'] if l and l.startswith('http')),None)
    pres=next((l.split(':',1)[1].strip() for l in lines if l.startswith('Presidente:')),None)
    if not prov or prov not in R: bad.append((terr,addr,prov))
    out.append(dict(territorio=terr,nome=nome,indirizzo=addr,provincia=prov,regione=R.get(prov),telefono=tel,email=email,sitoIndicato=web,presidente=pres))
json.dump(out,open('federal-parsed.json','w'),ensure_ascii=False,indent=1)
print(len(out),'bad',bad)
print(sum(1 for o in out if not o['email']),'noemail',sum(1 for o in out if not o['telefono']),'notel',sum(1 for o in out if o['sitoIndicato']),'web')
