# VJ AI Forge — Admin Portal

Separate React application for platform administrators (`admin.academy.com` in production).

## Local development

```bash
npm install
cp .env.example .env   # same Supabase keys as the API + portal
npm run dev            # http://localhost:5174
```

Also run:
- **API** `vi_ai_forge_api` on `:3001`
- **User portal** `vi_ai_forge` on `:5173`

## Architecture

```
academy.com (vi_ai_forge)     →  Students & Teachers
admin.academy.com (this app)  →  Admins only
        \___________________________/
                      |
              vi_ai_forge_api :3001
                      |
                   Supabase
```

## Production domains

| App | Folder | Domain |
|-----|--------|--------|
| User portal | `vi_ai_forge` | `academy.com` |
| Admin portal | `vi_ai_forge_admin` | `admin.academy.com` |
| API | `vi_ai_forge_api` | `api.academy.com` |

Both frontends call the same backend API.
