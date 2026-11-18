# Diagnostic libéral: moving it to libertarien.net

New address: **https://www.libertarien.net/QuizLiberal/**
`www.quizliberal.xyz` and the old `churchofzer.com/Diagnostic` both redirect there.

## Status (18 November 2026)

- Done: quiz published to `libertarien.net/public_html/QuizLiberal` (plus `/quizliberal/` → `/QuizLiberal/`).
- Done: `churchofzer.com/Diagnostic/.htaccess` redirects every old address to the new one.
- Done: in `churchofzer.com/public_html/.htaccess` (shared with quizliberal.xyz, whose folder is a link to churchofzer.com), the old quizliberal.xyz rule pointing to `www.churchofzer.com/p/Diagnostic.html` now points to the new address.
- Done: SiteGround's own redirect for quizliberal.xyz (churchofzer.com Site Tools › Domain › Redirects) now points to `https://www.libertarien.net/QuizLiberal/`. `quizliberal.xyz` and `www.`, over http and https, reach the quiz in one redirect.
- Backups of everything replaced: `~/quizliberal-backups/` on each site.
- The deploy key `quizliberal-deploy` can be removed from SSH Keys Manager on both sites (and `~\.ssh\quizliberal_deploy*` on this PC) when you no longer need to redeploy.

## What's in this folder

| Path | What it is |
|---|---|
| `site/` | The new quiz, ready to upload as-is (static: HTML, CSS, JS, fonts, the 6 pyramid images, `.htaccess`). No PHP and no database. |
| `redirection-churchofzer/.htaccess` | Goes into the old folder `churchofzer.com/public_html/Diagnostic/` and sends every old address to the new one. |
| `deploy.ps1` | Uploads both over SSH, the same way as the libertarien.net site. |
| `preview.ps1` | Local preview: run it, then open http://localhost:8765/QuizLiberal/ |
| `index.php`, `diag*.php`, `phpformbuilder/`… | The old version, left untouched. It is no longer needed. |

The scoring is the one from the old `index.php` (same thresholds, verdicts and pyramid images), with two answer mappings corrected (see Notes). All six outcomes were checked.

## 1. Publish the quiz on libertarien.net

**With the script** (needs your SiteGround SSH key, as for the libertarien.net deploy):

```powershell
.\deploy.ps1 -LibertarienUser <SSH username of libertarien.net>
```

The SSH username is in Site Tools (libertarien.net) › Devs › SSH Keys Manager › your key › Actions › SSH Credentials. The script uses the deploy key `~\.ssh\quizliberal_deploy` (its public half, `quizliberal_deploy.pub`, must be imported in SSH Keys Manager on both sites). Use `-Key C:\path\to\key` for another key. Once the move is done, you can delete that key in SSH Keys Manager and in `~\.ssh`. If a `QuizLiberal` folder already exists, the script saves it in `~/quizliberal-backups/` first. It also creates a lowercase `quizliberal` folder that redirects `/quizliberal/` to `/QuizLiberal/`, since paths on the server are case-sensitive.

**Or by hand**: Site Tools (libertarien.net) › Site › File Manager › `public_html` › create the folder `QuizLiberal` › upload the **contents** of `site/` into it. Include the hidden `.htaccess` file: without it, the React site takes over `/QuizLiberal/` and shows its 404 page.

Then open https://www.libertarien.net/QuizLiberal/. If you still see the main site, flush the cache: Site Tools › Speed › Caching › Dynamic Cache › Flush.

## 2. Point www.quizliberal.xyz to the new address

`quizliberal.xyz` is currently a SiteGround redirect (`301 → http://churchofzer.com/Diagnostic`). It is set up in the Site Tools of the site where the domain is parked, most likely **churchofzer.com**:

1. Site Tools › Domain › Redirects.
2. Delete the existing redirect for `quizliberal.xyz`.
3. Create a new one: domain `quizliberal.xyz`, path `/`, type **Permanent (301)**, target `https://www.libertarien.net/QuizLiberal/`. If `www.quizliberal.xyz` is listed separately, do the same for it.

Even if you skip this step, step 3 makes quizliberal.xyz work anyway, with two redirects instead of one.

## 3. Redirect the old address on churchofzer.com

Do this once step 1 works.

```powershell
.\deploy.ps1 -ChurchUser <SSH username of churchofzer.com>
```

Or by hand: upload `redirection-churchofzer/.htaccess` into `churchofzer.com/public_html/Diagnostic/`.

You can do steps 1 and 3 in one go: `.\deploy.ps1 -LibertarienUser … -ChurchUser …`. The script checks that the new page is online before it adds the redirect.

This also closes the old files that are still publicly reachable today, for example `churchofzer.com/Diagnostic/phpformbuilder/register.php` and `diag-test.php`. Once the redirect has worked for a while, you can delete the old folder's contents and keep only the `.htaccess`. The 26 MB `php_errorlog` can go too: it was filled by phpformbuilder warnings, which the new version doesn't use.

## 4. Check

```powershell
curl.exe -sI https://www.quizliberal.xyz
```
```powershell
curl.exe -sI https://churchofzer.com/Diagnostic/
```

Both should answer `301` with `Location: https://www.libertarien.net/QuizLiberal/`.

## Notes

- Answers are scored in the visitor's browser and saved there (localStorage), so they can stop and resume later. Nothing is sent to the server.
- Fonts are self-hosted, as on libertarien.net. The video uses `youtube-nocookie.com`.
- Two answer mappings from the old `index.php` were typos and are corrected in `site/diagnostic.js`. A few people near a threshold may therefore get a slightly different verdict than on the old site:
  - **Q29**: "Plutôt, oui" scored `i` and "Tout à fait" scored `j`, swapped compared with the other questions in that group. Now `'lkji'`.
  - **Q32**: "Pas du tout" scored `i` instead of `d`. Now `'dcba'`.
