import httpx, json, re, concurrent.futures as cf
from bs4 import BeautifulSoup
H={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36"}
out=[]
for page in (1,2,3):
    u="https://www.cercolavoroinhotel.it/bacheca-annunci"+("" if page==1 else f"?page={page}")
    r=httpx.get(u,headers=H,timeout=30,follow_redirects=True)
    s=BeautifulSoup(r.text,"html.parser")
    for li in s.select("ul.cards > li.card"):
        cols=li.select_one(".content-card").find_all("div",recursive=False)
        det=cols[1]; job=cols[2]; right=cols[3]
        name=det.select_one("a.card-hotel-name")
        stars=len(name.select("i.la-star")) if name else 0
        nome=name.get_text(" ",strip=True) if name else None
        prof=name["href"] if name else None
        loc=None
        for p in det.find_all("p"):
            if p.find("i",class_="la-map-marker"): loc=p.get_text(" ",strip=True)
        mail=None
        m=det.find("a",href=re.compile("^mailto:"))
        if m: mail=m["href"][7:].split("?")[0]
        tel=[a["href"][4:].strip() for a in det.find_all("a",href=re.compile("^tel:"))]
        h4=li.select_one("h4.emply-title a")
        if not h4:
            print("SKIP",li.get_text(" ",strip=True)[:150]); continue
        job=h4.find_parent("h4").parent
        ruolo=h4.get_text(" ",strip=True); url=h4["href"]
        contratto=orario=None; alloggio=None; retr=None
        for p in job.find_all("p",recursive=False):
            t=p.get_text(" ",strip=True)
            if t.startswith("Tipo contratto:"): contratto=t.split(":",1)[1].strip() or None
            elif t.startswith("Orario:"): orario=t.split(":",1)[1].strip() or None
            elif "alloggio" in t.lower() and len(t)<60: alloggio = not ("non offre" in t.lower())
            elif "Retribuzione" in t: retr=re.sub(r"\s+"," ",t)
        descs=job.select("p.d-none.d-md-block.d-lg-block")
        desc=descs[0].get_text("\n",strip=True) if descs else None
        if not retr:
            for el in job.find_all(string=re.compile("Retribuzione")):
                retr=re.sub(r"\s+"," ",el.parent.get_text(" ",strip=True))
        dt=right.find("span").get_text(strip=True)
        out.append(dict(azienda=nome,stelle=stars or None,profilo=prof,localita=loc,email=mail,telefoni=tel,ruolo=ruolo,url=url,contratto=contratto,orario=orario,alloggio=alloggio,retribuzione=retr,descrizione=desc,inserito=dt,pagina=u))
def chk(o):
    try:
        r=httpx.get(o["url"],headers=H,timeout=30,follow_redirects=True); return r.status_code, len(r.text)
    except Exception as e: return str(e),0
with cf.ThreadPoolExecutor(8) as ex:
    for o,res in zip(out,ex.map(chk,out)): o["check"]=res
json.dump(out,open("hotel-parsed.json","w"),ensure_ascii=False,indent=1)
print(len(out))
for o in out: print(o["inserito"],o["localita"],"|",o["azienda"],"|",o["ruolo"],"|",o["contratto"],o["orario"],o["alloggio"],"|",(o["retribuzione"] or "")[:60],o["check"])
