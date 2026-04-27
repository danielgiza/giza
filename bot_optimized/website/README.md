# Website de vanzare - SwingBot Pro

Website static profesional pentru prezentarea si vanzarea robotului.

## Rulare locala

Din folderul `bot_optimized/website`:

```bash
python3 -m http.server 8080
```

Apoi deschizi in browser:

- http://localhost:8080

## Fisiere

- `index.html` - structura paginii
- `styles.css` - design responsive
- `app.js` - comportament formular + anul curent

## Personalizare rapida

1. Schimba adresa din `app.js`:
   - `vanzari@exemplu.com`
2. Actualizeaza pachetele/preturile din `index.html`
3. Daca ai rezultate reale auditate, inlocuieste sectiunea de performanta cu datele tale

## Publicare

Poti publica pe:

- Netlify
- Vercel
- GitHub Pages
- orice hosting static
