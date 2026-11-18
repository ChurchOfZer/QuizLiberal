# Local preview: .\preview.ps1 then open http://localhost:8765/QuizLiberal/ (Ctrl+C to stop).
# Serves site\ under /QuizLiberal/ like the real site; / redirects there.
param([string]$Root = (Join-Path $PSScriptRoot 'site'), [int]$Port = 8765)
$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.svg'='image/svg+xml'; '.jpg'='image/jpeg'; '.woff2'='font/woff2'; '.png'='image/png' }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root on http://localhost:$Port/QuizLiberal/"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
  $res = $ctx.Response
  try {
    if (-not $path.StartsWith('/QuizLiberal/')) { $res.StatusCode = 302; $res.RedirectLocation = '/QuizLiberal/'; $res.Close(); continue }
    $rel = $path.Substring('/QuizLiberal/'.Length)
    if ($rel -eq '') { $rel = 'index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $Root $rel))
    if (-not $file.StartsWith($Root) -or -not (Test-Path $file -PathType Leaf)) { $res.StatusCode = 404; $res.Close(); continue }
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $res.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' })
    $res.Headers.Add('Cache-Control', 'no-store')
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    $res.Close()
    Write-Host "200 $path"
  } catch { try { $res.StatusCode = 500; $res.Close() } catch {} }
}
