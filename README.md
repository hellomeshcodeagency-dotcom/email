# FHG Quiz + Admin Leaderboard

## Structure
```
fhg-quiz/
├── netlify.toml
├── package.json
├── public/
│   ├── index.html        ← quiz (participants)
│   └── admin.html        ← admin panel (/admin)
└── netlify/
    ├── lib/
    │   ├── questions.mjs ← questions + answer key (server only)
    │   └── http.mjs
    └── functions/
        ├── start.mjs           → POST /api/start
        ├── submit.mjs          → POST /api/submit
        └── admin-attempts.mjs  → GET/DELETE /api/admin/attempts
```

## Deploy (GitHub web + Netlify)
1. Create a new GitHub repo → "uploading an existing file" → drag in everything inside `fhg-quiz/` (keep the folders).
2. Netlify → Add new site → Import from GitHub → pick the repo. Build settings are read from `netlify.toml` (leave the build command empty).
3. Netlify → Site configuration → Environment variables → add `ADMIN_PASSWORD` = your password.
4. Deploys → Trigger deploy → Clear cache and deploy site.

Quiz: `https://your-site.netlify.app/`
Admin: `https://your-site.netlify.app/admin`

## Editing questions
Edit only `netlify/lib/questions.mjs`. If you change the quiz, also change `key` there **and** `KEY` at the top of the script in `public/index.html` so previous participants are allowed to take the new version.
