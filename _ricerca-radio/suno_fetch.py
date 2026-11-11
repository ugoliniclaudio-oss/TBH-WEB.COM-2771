"""Scarica i METADATI pubblici dei brani dei profili Suno (nessun audio)."""
import json, time, httpx, sys
H = {"User-Agent": "Mozilla/5.0"}
out = {}
for handle in ["hugoveejay", "jchugo"]:
    clips, page = {}, 1
    while True:
        for t in range(5):
            r = httpx.get(f"https://studio-api.prod.suno.com/api/profiles/{handle}",
                          params={"page": page, "playlists_sort_by": "created_at", "clips_sort_by": "created_at"},
                          headers=H, timeout=30)
            if r.status_code == 200: break
            time.sleep(3 + t * 3)
        d = r.json()
        cs = d.get("clips") or []
        if not cs: break
        for c in cs:
            m = c.get("metadata") or {}
            clips[c["id"]] = {
                "id": c["id"], "title": (c.get("title") or "").strip(),
                "image": c.get("image_large_url") or c.get("image_url"),
                "duration": m.get("duration"), "tags": m.get("tags"),
                "created_at": c.get("created_at"), "is_public": c.get("is_public"),
                "status": c.get("status"), "display_name": c.get("display_name"),
                "handle": c.get("handle"), "video_url": c.get("video_url"),
            }
        print(handle, page, len(cs), len(clips), d.get("num_total_clips"), file=sys.stderr)
        page += 1
        time.sleep(0.6)
    pls = [{"id": p["id"], "name": p.get("name"), "n": p.get("num_total_results")} for p in (d.get("playlists") or [])]
    out[handle] = {"total": d.get("num_total_clips"), "clips": list(clips.values())}
json.dump(out, open("/home/user/tbh-web/_ricerca-radio/suno.json", "w"), ensure_ascii=False, indent=1)
