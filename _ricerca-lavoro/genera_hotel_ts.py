import json,re
d=json.load(open("hotel-parsed.json"))
PROV={"Rimini":"RN","Riccione":"RN","Misano Adriatico":"RN","Cesenatico":"FC","Cattolica":"RN"}
CAT=[("Reception/Backoffice",r"recept|segretari|backoffice|booking"),("Portiere di notte",r"portiere"),("Piani",r"piani"),("Cucina",r"cuoc|cucina|capo partita|lavapiatti|pizz|pasticc"),("Sala Bar",r"camerier|barman|bar\b|maitre|sala"),("Animazione",r"animat"),("Piscina/Benessere",r"estetist|massagg|bagnin|piscin"),("Manutenzione",r"manutent|facchin|tuttofare")]
def cat(r):
    for c,p in CAT:
        if re.search(p,r,re.I): return c
    return "Altra qualifica"
def iso(s):
    g,m,a=s.split("/"); return f"{a}-{m}-{g}"
def slugify(u): return "hotel-"+u.rstrip("/").split("/")[-1].split("_")[0]
out=[]
for o in d:
    if not o.get("verificaPagina"): continue
    desc=o["descrizione"]; t=(desc or "").lower()
    per=[]
    if re.search(r"natal",t): per.append("Natale / periodo natalizio")
    if re.search(r"estiv|estate",t): per.append("Stagione estiva 2027" if "2027" in t else "Stagione estiva")
    elif "2027" in t and "stagion" in t: per.append("Stagione 2027")
    c=o["contratto"]
    tipo="stagionale" if (c=="stagionale" or per) else ("continuativo" if c=="tempo indeterminato" else None)
    orario=[]
    if o["orario"]=="full time": orario=["full-time"]
    elif o["orario"]=="part time": orario=["part-time"]
    retr=o["retribuzione"]
    if retr: retr=retr.replace("Retribuzione lorda mensile: ","Retribuzione lorda mensile dichiarata: ").replace(" — "," – ")
    loc=o["localita"]
    out.append(dict(slug=slugify(o["url"]),provenienza="esterna",titolo=o["ruolo"],azienda=o["azienda"]+(" "+"★"*o["stelle"] if o["stelle"] else ""),
      localita=loc,luoghi=[dict(regione="Emilia-Romagna",provincia=PROV.get(loc),comune=loc)],
      settore="Hotellerie e ricettivo",ruoli=[cat(o["ruolo"])],requisiti=None,
      periodo=", ".join(per) or None,periodi=per,tipoPeriodo=tipo,orario=orario,alloggio=o["alloggio"],
      contratto=c,condizioni=retr,pubblicato=iso(o["inserito"]),scadenza=None,
      fonte=dict(nome="Cerco Lavoro in Hotel (Federalberghi)",url=o["url"]),
      scheda=dict(tipo="esterna",url=o["url"]),
      contatti=dict(email=o["email"],telefoni=o["telefoni"],profilo=o["profilo"]),
      descrizione=desc,immagine=None,rilevato="2026-10-06"))
print(len(out))
ts="// Generato da _ricerca-lavoro/genera_hotel_ts.py dalla bacheca pubblica di cercolavoroinhotel.it\n// (pagine 1-3, rilevate e verificate una per una il 2026-10-06). Testi e importi come nell'originale.\nimport type { AnnuncioBacheca } from \"./bacheca-annunci\";\n\nexport const ANNUNCI_HOTEL_RILEVATI: AnnuncioBacheca[] = "+json.dumps(out,ensure_ascii=False,indent=2)+";\n"
open("../packages/web/src/web/lib/bacheca-hotel-dati.ts","w").write(ts)
