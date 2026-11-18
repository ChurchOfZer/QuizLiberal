# Publishes the Diagnostic liberal quiz to SiteGround over SSH.
#
#   Quiz to libertarien.net  (site\ -> ~/www/libertarien.net/public_html/QuizLiberal,
#   plus a lowercase /quizliberal/ that redirects to /QuizLiberal/):
#     .\deploy.ps1 -LibertarienUser u123-abcdefgh
#
#   Old address on churchofzer.com redirected to the new one
#   (redirection-churchofzer\.htaccess -> ~/www/churchofzer.com/public_html/Diagnostic/.htaccess):
#     .\deploy.ps1 -ChurchUser u456-ijklmnop
#
#   Both in one go (the redirect is only put in place once the new page answers):
#     .\deploy.ps1 -LibertarienUser u123-abcdefgh -ChurchUser u456-ijklmnop
#
# SSH usernames: Site Tools of each site > Devs > SSH Keys Manager > your key > Actions > SSH Credentials.
# The key defaults to ~\.ssh\quizliberal_deploy, a key made for this deploy: import ~\.ssh\quizliberal_deploy.pub in
# Site Tools > Devs > SSH Keys Manager > Import, on both sites. Pass -Key to use another key (ssh asks for its passphrase).
# Nothing is deleted for good: the previous quiz folder and any previous .htaccess are saved in ~/quizliberal-backups.
param(
    [string]$LibertarienUser,
    [string]$ChurchUser,
    [string]$Key = (Join-Path $HOME '.ssh\quizliberal_deploy'),
    [int]$Port = 18765
)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$newUrl = 'https://www.libertarien.net/QuizLiberal/'
if (-not $LibertarienUser -and -not $ChurchUser) { throw 'Give -LibertarienUser, -ChurchUser, or both (see the top of this file).' }

$sshOpts = @('-o', 'StrictHostKeyChecking=accept-new', '-o', 'ConnectTimeout=20')
if (Test-Path $Key) { $sshOpts = @('-i', $Key) + $sshOpts } else { Write-Host "Key $Key not found: ssh will use ssh-agent / your default keys." }

function Write-Unix([string]$path, [string]$text) {
    [IO.File]::WriteAllText($path, ($text -replace "`r", ''), (New-Object System.Text.UTF8Encoding($false)))
}

function Invoke-Remote([string]$target, [string[]]$files, [string]$scriptName) {
    Write-Host "Uploading to $target ..."
    & scp @sshOpts -P $Port @files "${target}:"
    if ($LASTEXITCODE) { throw "Upload to $target failed" }
    & ssh @sshOpts -p $Port $target "bash ~/$scriptName"
    if ($LASTEXITCODE) { throw "Publishing on $target failed (exit $LASTEXITCODE)" }
}

$tmp = Join-Path ([IO.Path]::GetTempPath()) ('quizliberal-deploy-' + [guid]::NewGuid())
New-Item -ItemType Directory $tmp | Out-Null
try {
    if ($LibertarienUser) {
        $release = Join-Path $tmp 'quizliberal-release.tar.gz'
        & tar -czf $release -C (Join-Path $root 'site') .
        if ($LASTEXITCODE) { throw 'Packing site\ failed' }
        Write-Unix (Join-Path $tmp 'quizliberal-deploy.sh') @'
set -e
cd ~/www/libertarien.net/public_html
stamp=$(date +%Y%m%d-%H%M%S)
mkdir -p ~/quizliberal-backups
if [ -d QuizLiberal ]; then tar -czf ~/quizliberal-backups/QuizLiberal-$stamp.tar.gz QuizLiberal; fi
rm -rf QuizLiberal.new
mkdir QuizLiberal.new
tar -xzf ~/quizliberal-release.tar.gz -C QuizLiberal.new
rm -rf QuizLiberal
mv QuizLiberal.new QuizLiberal
find QuizLiberal -type d -exec chmod 755 {} +
find QuizLiberal -type f -exec chmod 644 {} +
# Lowercase address: /quizliberal/... -> /QuizLiberal/...
mkdir -p quizliberal
printf 'RewriteEngine On\nRewriteRule ^(.*)$ /QuizLiberal/$1 [R=301,L]\n' > quizliberal/.htaccess
chmod 755 quizliberal
chmod 644 quizliberal/.htaccess
rm -f ~/quizliberal-release.tar.gz ~/quizliberal-deploy.sh
echo "Quiz published to ~/www/libertarien.net/public_html/QuizLiberal"
'@
        Invoke-Remote "$LibertarienUser@ssh.libertarien.net" @($release, (Join-Path $tmp 'quizliberal-deploy.sh')) 'quizliberal-deploy.sh'

        # Check the new page answers before anything points to it.
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $page = Invoke-WebRequest ($newUrl + '?check=' + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()) -UseBasicParsing
        if ($page.Content -notmatch 'diagnostic\.js') { throw "$newUrl does not show the quiz yet (flush the SiteGround cache and retry). The redirect was NOT put in place." }
        Write-Host "$newUrl is online."
    }

    if ($ChurchUser) {
        Copy-Item (Join-Path $root 'redirection-churchofzer\.htaccess') (Join-Path $tmp 'quizliberal-redirect.htaccess')
        Write-Unix (Join-Path $tmp 'quizliberal-redirect.sh') @'
set -e
cd ~/www/churchofzer.com/public_html/Diagnostic
stamp=$(date +%Y%m%d-%H%M%S)
mkdir -p ~/quizliberal-backups
if [ -f .htaccess ]; then cp .htaccess ~/quizliberal-backups/churchofzer-Diagnostic-htaccess-$stamp; fi
mv ~/quizliberal-redirect.htaccess .htaccess
chmod 644 .htaccess
rm -f ~/quizliberal-redirect.sh
echo "churchofzer.com/Diagnostic now redirects to https://www.libertarien.net/QuizLiberal/"
'@
        Invoke-Remote "$ChurchUser@ssh.churchofzer.com" @((Join-Path $tmp 'quizliberal-redirect.htaccess'), (Join-Path $tmp 'quizliberal-redirect.sh')) 'quizliberal-redirect.sh'
    }
} finally {
    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
