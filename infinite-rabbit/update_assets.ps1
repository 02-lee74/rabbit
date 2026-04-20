$panda_idle = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\HANA\.gemini\antigravity\brain\804dc91f-6672-4242-b861-f691b79d7a84\panda_idle_1776319913329.png"))
$panda_jump = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\HANA\.gemini\antigravity\brain\804dc91f-6672-4242-b861-f691b79d7a84\panda_jump_1776319927202.png"))
$tiger_idle = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\HANA\.gemini\antigravity\brain\804dc91f-6672-4242-b861-f691b79d7a84\tiger_idle_1776319941070.png"))
$tiger_jump = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\HANA\.gemini\antigravity\brain\804dc91f-6672-4242-b861-f691b79d7a84\tiger_jump_1776319955779.png"))
$bg_bamboo = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\HANA\.gemini\antigravity\brain\804dc91f-6672-4242-b861-f691b79d7a84\bg_bamboo_1776319969962.png"))
$bg_lake = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\HANA\.gemini\antigravity\brain\804dc91f-6672-4242-b861-f691b79d7a84\bg_lake_1776319982825.png"))

$assetsData = [IO.File]::ReadAllText("C:\Users\HANA\.gemini\antigravity\scratch\infinite-rabbit\assetsData.js")

$replacement = ",`n`"panda_idle`": `"data:image/png;base64,$panda_idle`",`n`"panda_jump`": `"data:image/png;base64,$panda_jump`",`n`"tiger_idle`": `"data:image/png;base64,$tiger_idle`",`n`"tiger_jump`": `"data:image/png;base64,$tiger_jump`",`n`"bg_bamboo`": `"data:image/png;base64,$bg_bamboo`",`n`"bg_lake`": `"data:image/png;base64,$bg_lake`"`n};"

$assetsData = $assetsData.Replace("};", $replacement)
[IO.File]::WriteAllText("C:\Users\HANA\.gemini\antigravity\scratch\infinite-rabbit\assetsData.js", $assetsData)
Write-Output "Update complete"
