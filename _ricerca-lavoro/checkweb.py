import json,httpx,asyncio,sys
o=json.load(open('federal-parsed.json'))
UA={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36"}
async def chk(c,u):
    try:
        r=await c.get(u)
        t=r.text
        return dict(url=u,status=r.status_code,final=str(r.url),len=len(t))
    except Exception as e:
        return dict(url=u,status=None,err=str(e)[:150])
async def main():
    urls=sorted({x['sitoIndicato'] for x in o if x['sitoIndicato']})
    async with httpx.AsyncClient(headers=UA,timeout=30,follow_redirects=True) as c:
        res=await asyncio.gather(*[chk(c,u) for u in urls])
    json.dump(res,open('federal-web.json','w'),indent=1)
    ok=[r for r in res if r.get('status')==200 and r.get('len',0)>2000]
    print(len(urls),'ok',len(ok))
    for r in res:
        if r not in ok: print(r)
asyncio.run(main())
