import httpx,concurrent.futures,json,hashlib,sys
from bs4 import BeautifulSoup
H={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36'}
def get(url):
 try:
  r=httpx.get(url,follow_redirects=True,timeout=35,headers=H);s=BeautifulSoup(r.text,'html.parser');[e.decompose() for e in s(['script','style'])];d={'url':url,'final':str(r.url),'status':r.status_code,'text':s.get_text(' ',strip=True),'links': [{'text':a.get_text(' ',strip=True),'url':a.get('href')} for a in s.select('a[href]')]};p='_ricerca-lavoro/'+hashlib.md5(url.encode()).hexdigest()+'.json';open(p,'w').write(json.dumps(d,ensure_ascii=False,indent=2));return url,r.status_code,len(d['text']),p
 except Exception as e:return url,'ERR '+str(e)[:150]
def load(url):
 return json.load(open('_ricerca-lavoro/'+hashlib.md5(url.encode()).hexdigest()+'.json'))
if __name__=='__main__':
 for x in concurrent.futures.ThreadPoolExecutor(8).map(get,sys.argv[1:]):print(x)
