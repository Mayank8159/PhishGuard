# Script to change commit times from first to last commit to today 2 PM - 3 PM
# Run this script in the PhishGuard repository directory

$ErrorActionPreference = "Stop"

Write-Host "Changing commit times to today (Feb 22, 2026) between 2:00 PM and 3:00 PM..." -ForegroundColor Cyan

# Get total number of commits
$totalCommits = (git rev-list --count HEAD)
Write-Host "Total commits found: $totalCommits" -ForegroundColor Yellow

if ($totalCommits -eq 0) {
    Write-Host "No commits found!" -ForegroundColor Red
    exit 1
}

# Calculate time increment in seconds (1 hour = 3600 seconds distributed across commits)
$timeIncrement = [math]::Floor(3600 / $totalCommits)

# Base date: February 22, 2026, 2:00 PM
$baseDate = Get-Date -Year 2026 -Month 2 -Day 22 -Hour 14 -Minute 0 -Second 0

Write-Host "Time increment per commit: $timeIncrement seconds" -ForegroundColor Green
Write-Host "`nStarting rewrite...`n" -ForegroundColor Cyan

# Create filter script for git filter-branch
$filterScript = @"
#!/bin/bash
COMMIT_NUMBER=`$(git rev-list --reverse HEAD | grep -n `$GIT_COMMIT | cut -d: -f1)
SECONDS_TO_ADD=`$(( (`$COMMIT_NUMBER - 1) * $timeIncrement ))
NEW_DATE="`$(date -d '2026-02-22 14:00:00 +`${SECONDS_TO_ADD} seconds' +'%a %b %d %H:%M:%S %Y %z')"
export GIT_AUTHOR_DATE="`$NEW_DATE"
export GIT_COMMITTER_DATE="`$NEW_DATE"
"@

# For Windows, we need to use PowerShell-based approach
Write-Host "Creating temporary branch for rewrite..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD

# Get all commits in reverse order (oldest first)
$commits = git rev-list --reverse HEAD

$commitIndex = 0
foreach ($commit in $commits) {
    $secondsOffset = $commitIndex * $timeIncrement
    $newDate = $baseDate.AddSeconds($secondsOffset)
    $dateString = $newDate.ToString("ddd MMM dd HH:mm:ss yyyy K")
    
    Write-Host "[$($commitIndex + 1)/$totalCommits] Processing commit: $($commit.Substring(0,7)) -> $dateString" -ForegroundColor Gray
    $commitIndex++
}

Write-Host "`nTo apply these changes, you need to use git filter-branch or git rebase:" -ForegroundColor Yellow
Write-Host @"

Option 1 - Using git filter-branch (easier, rewrites all history):
--------------------------------------------------------------------
git filter-branch -f --env-filter '
COMMIT_NUM=`$(git rev-list --reverse HEAD | grep -n `$GIT_COMMIT | cut -d: -f1)
SECONDS_OFFSET=`$(( (`$COMMIT_NUM - 1) * $timeIncrement ))
BASE_TIMESTAMP=1740240000
NEW_TIMESTAMP=`$(( BASE_TIMESTAMP + SECONDS_OFFSET ))
export GIT_AUTHOR_DATE="@`$NEW_TIMESTAMP"
export GIT_COMMITTER_DATE="@`$NEW_TIMESTAMP"
' HEAD

Option 2 - Manual approach (Windows compatible):
--------------------------------------------------------------------
"@ -ForegroundColor Cyan

Write-Host "`nGenerating Windows-compatible rewrite script..." -ForegroundColor Yellow

# Generate rebase script
$rebaseScript = "# Git commit time rewrite commands`n"
$rebaseScript += "# Run these in Git Bash or WSL`n`n"

$commitIndex = 0
$commits = git rev-list --reverse HEAD
foreach ($commit in $commits) {
    $secondsOffset = $commitIndex * $timeIncrement
    $timestamp = 1740240000 + $secondsOffset  # Unix timestamp for 2026-02-22 14:00:00 UTC
    
    $rebaseScript += "# Commit $($commitIndex + 1): $($commit.Substring(0,10))`n"
    $commitIndex++
}

$scriptPath = Join-Path $PSScriptRoot "rewrite_commits.sh"
$bashScript = @"
#!/bin/bash
# Rewrite commit times for PhishGuard repository
# Date range: February 22, 2026, 2:00 PM - 3:00 PM

echo "Rewriting commit times..."

git filter-branch -f --env-filter '
COMMIT_NUM=`$(git rev-list --reverse HEAD | grep -n `$`$GIT_COMMIT | cut -d: -f1)
SECONDS_OFFSET=`$(( (`$`$COMMIT_NUM - 1) * $timeIncrement ))
BASE_TIMESTAMP=1740240000
NEW_TIMESTAMP=`$(( `$`$BASE_TIMESTAMP + `$`$SECONDS_OFFSET ))
export GIT_AUTHOR_DATE="@`$`$NEW_TIMESTAMP"
export GIT_COMMITTER_DATE="@`$`$NEW_TIMESTAMP"
' HEAD

echo "Done! Commit times have been rewritten."
echo "Run 'git log --pretty=format:\"%h %ad %s\" --date=local' to verify"
"@

Set-Content -Path $scriptPath -Value $bashScript -Encoding UTF8

Write-Host "`nBash script generated: $scriptPath" -ForegroundColor Green
Write-Host "Run this in Git Bash or WSL to apply changes.`n" -ForegroundColor Green

Write-Host "⚠️  WARNING: This will rewrite Git history! ⚠️" -ForegroundColor Red
Write-Host "Make sure to backup your repository before proceeding.`n" -ForegroundColor Red

Write-Host "To execute (in Git Bash or WSL):" -ForegroundColor Yellow
Write-Host "  cd '$PSScriptRoot'" -ForegroundColor White
Write-Host "  bash rewrite_commits.sh" -ForegroundColor White
Write-Host "  git push --force" -ForegroundColor White
