#!/bin/bash
# Rewrite commit times for PhishGuard repository
# Date range: February 22, 2026, 2:00 PM - 3:00 PM

echo "🔄 Rewriting commit times..."
echo "Target: February 22, 2026, 2:00 PM - 3:00 PM"
echo ""

# Count total commits
TOTAL_COMMITS=$(git rev-list --count HEAD)
echo "Total commits to rewrite: $TOTAL_COMMITS"

# Calculate time increment (3600 seconds = 1 hour distributed across commits)
TIME_INCREMENT=$((3600 / TOTAL_COMMITS))
echo "Time increment per commit: $TIME_INCREMENT seconds"
echo ""

# Base timestamp: February 22, 2026, 2:00 PM (Unix timestamp: 1740240000)
BASE_TIMESTAMP=1740240000

# Backup current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"
echo ""
echo "⚠️  WARNING: This will rewrite Git history!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo ""
echo "Starting rewrite..."
echo ""

git filter-branch -f --env-filter '
COMMIT_NUM=$(git rev-list --reverse HEAD | grep -n $GIT_COMMIT | cut -d: -f1)
SECONDS_OFFSET=$(( ($COMMIT_NUM - 1) * '"$TIME_INCREMENT"' ))
NEW_TIMESTAMP=$(( '"$BASE_TIMESTAMP"' + $SECONDS_OFFSET ))
export GIT_AUTHOR_DATE="@$NEW_TIMESTAMP"
export GIT_COMMITTER_DATE="@$NEW_TIMESTAMP"
' HEAD

echo ""
echo "✅ Done! Commit times have been rewritten."
echo ""
echo "Verify with: git log --pretty=format:\"%h %ad %s\" --date=local"
echo ""
echo "To push changes: git push --force"
