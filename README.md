# QuizLiberal

**Diagnostic libéral**: 64 questions, one at a time, that place you on the *pyramide de la Liberté*, from étatiste to anarcho-capitaliste.

Live at **https://www.libertarien.net/QuizLiberal/** (`www.quizliberal.xyz` redirects there).

## How it works

A static page with no server code and no database:

- `site/index.html` holds the intro, quiz and result views (hash routes: none, `#questions`, `#resultat`).
- `site/diagnostic.js` holds the 64 questions, their scoring letters and `diagnose()`. Answers are scored in the browser and saved in `localStorage`, so visitors can stop and resume. Nothing is sent anywhere.
- `site/diagnostic.css` follows the libertarien.net design (flame gradient, IBM Plex Sans, Bricolage Grotesque) with light and dark modes.
- `site/.htaccess` sets HTTPS and caching, and keeps libertarien.net's single-page fallback away from `/QuizLiberal/`.

## Preview locally

```powershell
.\preview.ps1
```

Then open http://localhost:8765/QuizLiberal/.

## Publish

```powershell
.\deploy.ps1 -LibertarienUser <SiteGround SSH username of libertarien.net>
```

This uploads `site/` to `public_html/QuizLiberal` over SSH. The previous version is saved in `~/quizliberal-backups/` on the server first. When you change `diagnostic.css` or `diagnostic.js`, bump its `?v=` number in `index.html` so browsers fetch the new file.

`redirection-churchofzer/.htaccess` is the redirect left in the old `churchofzer.com/Diagnostic/` folder. [MIGRATION.md](MIGRATION.md) explains the move from churchofzer.com and the redirects in place.

## Credits

Fonts: IBM Plex Sans and Bricolage Grotesque, both under the SIL Open Font License.
