param(
  [string]$Path = "",
  [string]$Language = "",
  [switch]$ListLanguages
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false

function Write-Json($obj) {
  $obj | ConvertTo-Json -Compress -Depth 4
}

try {
  Add-Type -AssemblyName System.Runtime.WindowsRuntime | Out-Null
  [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
  [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
  [Windows.Storage.StorageFile, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null

  $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and
    $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  })[0]

  function Await($operation, $resultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($resultType)
    $netTask = $asTask.Invoke($null, @($operation))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
  }

  if ($ListLanguages) {
    $available = @()
    foreach ($lang in [Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages) {
      $available += $lang.LanguageTag
    }
    Write-Json @{ ok = $true; languages = $available }
    exit 0
  }

  if ($Path -eq "") {
    Write-Json @{ ok = $false; code = "no_path"; error = "No image path given." }
    exit 3
  }

  if ($Language -ne "") {
    $lang = New-Object Windows.Globalization.Language($Language)
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
  } else {
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
  }
  if ($null -eq $engine) {
    Write-Json @{ ok = $false; code = "no_language"; error = "Windows OCR has no Chinese language pack installed." }
    exit 2
  }

  $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Resolve-Path -LiteralPath $Path).Path)) ([Windows.Storage.StorageFile])
  $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])

  $lines = @()
  $words = @()
  foreach ($line in $result.Lines) {
    $lines += $line.Text
    foreach ($word in $line.Words) {
      $rect = $word.BoundingRect
      $words += @{
        t = $word.Text
        x = [math]::Round($rect.X, 1)
        y = [math]::Round($rect.Y, 1)
        w = [math]::Round($rect.Width, 1)
        h = [math]::Round($rect.Height, 1)
      }
    }
  }

  Write-Json @{
    ok = $true
    language = $engine.RecognizerLanguage.LanguageTag
    width = $bitmap.PixelWidth
    height = $bitmap.PixelHeight
    lines = $lines
    words = $words
  }
  exit 0
} catch {
  Write-Json @{ ok = $false; error = $_.Exception.Message }
  exit 1
}