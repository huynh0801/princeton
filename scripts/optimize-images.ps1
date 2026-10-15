param(
    [string]$SourceDir = "image",
    [string]$TargetDir = "assets/img",
    [int]$MaxWidth = 1920,
    [long]$Quality = 85
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)

$files = Get-ChildItem -Path $SourceDir -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|png)$' }

Write-Host "Found $($files.Count) image files to optimize..."

foreach ($file in $files) {
    $srcPath = $file.FullName
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name).ToLower()
    $destPath = Join-Path $TargetDir "$baseName.jpg"
    
    try {
        $img = [System.Drawing.Image]::FromFile($srcPath)
        $origW = $img.Width
        $origH = $img.Height
        
        $newW = $origW
        $newH = $origH
        
        if ($origW -gt $MaxWidth) {
            $newW = $MaxWidth
            $newH = [int](($origH * $MaxWidth) / $origW)
        }
        
        $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
        $gfx = [System.Drawing.Graphics]::FromImage($bmp)
        $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        $rect = New-Object System.Drawing.Rectangle(0, 0, $newW, $newH)
        $gfx.DrawImage($img, $rect)
        
        $bmp.Save($destPath, $jpegEncoder, $encoderParams)
        
        $gfx.Dispose()
        $bmp.Dispose()
        $img.Dispose()
        
        $origSizeMB = ($file.Length / 1MB).ToString("0.00")
        $newSizeKB = ((Get-Item $destPath).Length / 1KB).ToString("0.0")
        Write-Host "Optimized: $($file.Name) ($origSizeMB MB) -> $baseName.jpg ($newSizeKB KB)"
    }
    catch {
        Write-Warning "Failed to optimize $($file.Name): $_"
    }
}

Write-Host "Image optimization completed successfully!"
