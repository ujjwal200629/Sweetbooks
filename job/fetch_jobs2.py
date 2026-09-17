import urllib.request, json, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
url = 'https://remoteok.com/api?tags=react'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode())
        found = 0
        print('Active React Jobs from RemoteOK:')
        for j in data:
            if isinstance(j, dict):
                title = j.get('position', '').lower()
                if 'senior' not in title and 'lead' not in title and 'manager' not in title and 'director' not in title:
                    print(f"Title: {j.get('position')}")
                    print(f"Company: {j.get('company')}")
                    print(f"URL: {j.get('url')}")
                    print("---")
                    found += 1
                    if found >= 3:
                        break
except Exception as e:
    pass
