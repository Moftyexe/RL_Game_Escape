$ErrorActionPreference = 'Stop'
$workspace = (Get-Location).Path
$manifestPath = Join-Path $workspace 'tools/sfx-deletion-manifest.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if ($manifest.executed) { throw 'Cleanup already executed; do not delete again.' }
if ($manifest.root -ne '500-game-sound-effects') { throw 'Unexpected collection root.' }
$collection = (Resolve-Path -LiteralPath (Join-Path $workspace $manifest.root)).Path
$prefix = $collection + [IO.Path]::DirectorySeparatorChar
if (-not (Test-Path -LiteralPath (Join-Path $workspace 'docs/SFX_INTEGRATION_REPORT.md'))) { throw 'Selection report must exist before deletion.' }
$targets = @()
foreach ($item in $manifest.deleted) {
    $target = [IO.Path]::GetFullPath((Join-Path $workspace $item.path))
    if (-not $target.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) { throw "Outside SFX collection: $target" }
    if ([IO.Path]::GetExtension($target) -ne '.wav') { throw "Non-audio target: $target" }
    if (-not (Test-Path -LiteralPath $target -PathType Leaf)) { throw "Missing target: $target" }
    if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant() -ne $item.sha256) { throw "Changed target: $target" }
    $relative = $target.Substring($prefix.Length).Replace('\','/')
    if ($manifest.retained -contains $relative) { throw "Retained target: $target" }
    $targets += $target
}
# Full validation completes before the first deletion. Never recurse or shell out.
$targets | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $workspace 'tools/sfx-validated-deletions.json') -Encoding UTF8
foreach ($target in $targets) { Remove-Item -LiteralPath $target }
$manifest.executed = $true
$manifest | Add-Member -NotePropertyName deletedCount -NotePropertyValue $targets.Count -Force
$manifest | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
Write-Output "Deleted $($targets.Count) validated unused WAV files within $collection"
