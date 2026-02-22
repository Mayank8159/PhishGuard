# Native PowerShell script to rewrite commit times
# Changes all commits to today (Feb 22, 2026) between 2:00 PM and 3:00 PM

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "`n🔄 Git Commit Time Rewriter" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Check if in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

# Get total commits
$totalCommits = (git rev-list --count HEAD)
Write-Host "📊 Total commits: $totalCommits" -ForegroundColor Yellow

if ($totalCommits -eq 0) {
    Write-Host "❌ No commits found!" -ForegroundColor Red
    exit 1
}

# Calculate time distribution
$timeIncrement = [math]::Floor(3600 / $totalCommits)
Write-Host "⏱️  Time increment: $timeIncrement seconds per commit" -ForegroundColor Green

# Base date: Feb 22, 2026, 2:00 PM
$baseTimestamp = 1740240000

Write-Host "`n⚠️  WARNING: This will rewrite Git history!" -ForegroundColor Red
Write-Host "All commits will be changed to Feb 22, 2026, 2:00 PM - 3:00 PM" -ForegroundColor Yellow

if (-not $Force) {
    $confirm = Read-Host "`nType 'yes' to continue"
    if ($confirm -ne "yes") {
        Write-Host "❌ Aborted." -ForegroundColor Red
        exit 0
    }
}

Write-Host "`n🚀 Starting rewrite..." -ForegroundColor Cyan

# Create filter script
$filterScript = @"
`$commitList = git rev-list --reverse HEAD
`$commitNum = 0
`$commitHash = `$env:GIT_COMMIT

foreach (`$c in `$commitList) {
    `$commitNum++
    if (`$c -eq `$commitHash) {
        break
    }
}

`$secondsOffset = (`$commitNum - 1) * $timeIncrement
`$newTimestamp = $baseTimestamp + `$secondsOffset

`$env:GIT_AUTHOR_DATE = "@`$newTimestamp"
`$env:GIT_COMMITTER_DATE = "@`$newTimestamp"
"@

# Create temporary filter file
$filterFile = Join-Path $env:TEMP "git_filter_$(Get-Random).ps1"
Set-Content -Path $filterFile -Value $filterScript -Encoding UTF8

try {
    # Run git filter-branch with PowerShell filter
    $env:FILTER_BRANCH_SQUELCH_WARNING = "1"
    
    git filter-branch -f --env-filter "powershell -NoProfile -ExecutionPolicy Bypass -File `"$filterFile`"" HEAD
    
    Write-Host "`n✅ Success! Commit times have been rewritten." -ForegroundColor Green
    Write-Host "`n📋 Verifying changes..." -ForegroundColor Cyan
    
    git log --pretty=format:"%h %ad %s" --date=local -10
    
    Write-Host "`n`n💡 To push changes: git push --force" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ Error occurred: $_" -ForegroundColor Red
} finally {
    # Cleanup
    if (Test-Path $filterFile) {
        Remove-Item $filterFile -Force
    }
}
