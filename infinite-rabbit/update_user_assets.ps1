$tigerIdleBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\HANA\.gemini\antigravity\brain\b6a0ded3-ef99-43d0-88d5-a38358eb68a0\media__1776390968172.png"))
$tigerJumpBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\HANA\.gemini\antigravity\brain\b6a0ded3-ef99-43d0-88d5-a38358eb68a0\media__1776392227678.jpg")) # New 3x3 frame sprite sheet

# Read the entire JS file
$content = [IO.File]::ReadAllText("C:\Users\HANA\.gemini\antigravity\scratch\infinite-rabbit\assetsData.js")

# Replace tiger_idle and tiger_jump with the respective base64 strings
$content = $content -replace '"tiger_idle"\s*:\s*"[^"]+"', ("`"tiger_idle`": `"data:image/png;base64," + $tigerIdleBase64 + "`"")
$content = $content -replace '"tiger_jump"\s*:\s*"[^"]+"', ("`"tiger_jump`": `"data:image/jpeg;base64," + $tigerJumpBase64 + "`"")

[IO.File]::WriteAllText("C:\Users\HANA\.gemini\antigravity\scratch\infinite-rabbit\assetsData.js", $content)
Write-Output "Tiger Assets successfully updated with 3x3 Animated Sprite Sheet!"
