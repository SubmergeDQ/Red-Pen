Add-Type -AssemblyName System.Drawing

$src = "D:\HUANG\Documents\Projects\Github\Myself\Red-Pen\docs\参赛截图"
$dst = Join-Path $src "上传版"
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }

foreach ($f in Get-ChildItem $src -Filter *.png) {
  $img = [System.Drawing.Image]::FromFile($f.FullName)
  try {
    $maxW = 1600
    $scale = [Math]::Min(1.0, $maxW / $img.Width)
    $w = [int]($img.Width * $scale)
    $h = [int]($img.Height * $scale)

    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear([System.Drawing.Color]::White)
    $g.DrawImage($img, 0, 0, $w, $h)
    $g.Dispose()

    $out = Join-Path $dst ($f.BaseName + ".jpg")
    $targetKB = 460
    $quality = 88L
    do {
      $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
      $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
        [System.Drawing.Imaging.Encoder]::Quality, $quality)
      $bmp.Save($out, $codec, $ep)
      $ep.Dispose()
      $sizeKB = (Get-Item $out).Length / 1KB
      if ($sizeKB -le $targetKB) { break }
      $quality -= 6
    } while ($quality -gt 45)

    "{0,-26} {1,6} KB -> {2,5} KB (q={3})" -f $f.Name, [int]($f.Length / 1KB), [int]$sizeKB, $quality
    $bmp.Dispose()
  } finally {
    $img.Dispose()
  }
}

$sum = (Get-ChildItem $dst -Filter *.jpg | Measure-Object -Property Length -Sum).Sum
$count = (Get-ChildItem $dst -Filter *.jpg).Count
"TOTAL: $count files, $([math]::Round($sum / 1MB, 1)) MB"
