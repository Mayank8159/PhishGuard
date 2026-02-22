# PocketBase on Render (Docker)

## Deploy
1) Create a new Git repo and add this folder.
2) Push to GitHub.
3) On Render, create a **Web Service** from that repo.
4) Render will read `render.yaml` automatically.

## Persistent Data
The Render disk is mounted at:
```
/pb/pb_data
```
PocketBase data will persist there.

## Access
After deploy, your PocketBase URL will be:
```
https://<your-service>.onrender.com
```

Use that URL as `POCKETBASE_URL` in your backend.
