import httpx,concurrent.futures,json,hashlib
from bs4 import BeautifulSoup
urls=['https://www.agenzialavoro.emr.it/i-centri-per-limpiego','https://www.federalberghi.it/menu/associazioni-territoriali.aspx','https://www.cercolavoroinhotel.it/','https://www.regione.marche.it/Entra-in-Regione/Centri-Impiego/Dai-CPI','https://www.comune.rimini.it/amministrazione/organi-di-governo/giunta-comunale','https://www.comune.riccione.rn.it/it/persone/guidi-mattia','https://www.comune.riccione.rn.it/it/unita_organizzative/sezione-gestione-amministrativa-turismo-e-cultura']
def get(url):
 try:
  r=httpx.get(url,follow_redirects=True,timeout=35);s=BeautifulSoup(r.text,'html.parser');[e.decompose() for e in s(['script','style'])];d={'url':url,'final':str(r.url),'status':r.status_code,'text':s.get_text(' ',strip=True),'links': [{'text':a.get_text(' ',strip=True),'url':a.get('href')} for a in s.select('a[href]')]};p='_ricerca-lavoro/'+hashlib.md5(url.encode()).hexdigest()+'.json';open(p,'w').write(json.dumps(d,ensure_ascii=False,indent=2));return url,r.status_code,p
 except Exception as e:return url,str(e)
for x in concurrent.futures.ThreadPoolExecutor(8).map(get,urls):print(x)
