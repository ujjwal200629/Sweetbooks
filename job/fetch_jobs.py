import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://remotive.com/api/remote-jobs?category=software-dev"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode())
        jobs = data.get('jobs', [])
        found = 0
        print('Active React/Node Jobs from Remotive:')
        for j in jobs:
            title = j.get('title', '').lower()
            desc = j.get('description', '').lower()
            # Look for React or Node, and exclude senior if possible
            if ('react' in title or 'node' in title or 'react' in desc or 'node' in desc) and 'senior' not in title and 'staff' not in title and 'principal' not in title and 'lead' not in title and 'manager' not in title:
                print(f"Title: {j.get('title')}")
                print(f"Company: {j.get('company_name')}")
                print(f"URL: {j.get('url')}")
                print("---")
                found += 1
                if found >= 5:
                    break
except Exception as e:
    print(f"Error fetching Remotive: {e}")

url2 = "https://remoteok.com/api"
req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req2, context=ctx) as response:
        data = json.loads(response.read().decode())
        print('Active React/Node Jobs from RemoteOK:')
        for j in data:
            if isinstance(j, dict):
                title = j.get('position', '').lower()
                desc = j.get('description', '').lower()
                if ('react' in title or 'node' in title or 'react' in desc or 'node' in desc) and 'senior' not in title and 'lead' not in title:
                    print(f"Title: {j.get('position')}")
                    print(f"Company: {j.get('company')}")
                    print(f"URL: {j.get('url')}")
                    print("---")
                    found += 1
                    if found >= 15:
                        break
except Exception as e:
    print(f"Error fetching RemoteOK: {e}")
