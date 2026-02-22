@echo off
REM Git Commit Time Rewriter for Windows
REM Distributes commits between 2:00 PM and 3:00 PM on Feb 22, 2026

setlocal enabledelayedexpansion

REM Base timestamp: Feb 22, 2026, 2:00 PM (Unix timestamp)
set BASE_TIMESTAMP=1740240000

REM Total commits
for /f %%a in ('git rev-list --count HEAD') do set TOTAL_COMMITS=%%a

echo Total commits: %TOTAL_COMMITS%

REM Calculate time increment (3600 seconds / total commits)
set /a TIME_INCREMENT=3600/%TOTAL_COMMITS%

echo Time increment: %TIME_INCREMENT% seconds

echo.
echo WARNING: This will rewrite Git history!
echo All commits will be timestamped between 2:00 PM and 3:00 PM today.
echo.
set /p CONFIRM=Type 'yes' to continue: 

if not "%CONFIRM%"=="yes" (
    echo Aborted.
    exit /b
)

echo.
echo Rewriting commits...

REM Create filter script in current directory
(
echo ^#!/bin/sh
echo COMMIT_NUM=^$^(git rev-list --reverse HEAD ^| grep -n ^$GIT_COMMIT ^| cut -d: -f1^)
echo SECONDS_OFFSET=^$^(^( ^(^$COMMIT_NUM - 1^) * %TIME_INCREMENT% ^)^)
echo NEW_TIMESTAMP=^$^(^( %BASE_TIMESTAMP% + ^$SECONDS_OFFSET ^)^)
echo export GIT_AUTHOR_DATE="@^$NEW_TIMESTAMP"
echo export GIT_COMMITTER_DATE="@^$NEW_TIMESTAMP"
) > git_filter_temp.sh

REM Run filter-branch with sh script
set FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch -f --env-filter "sh ./git_filter_temp.sh" HEAD

echo.
echo Done! Verifying...
git log --pretty=format:"%%h %%ad %%s" --date=local -10

echo.
echo.
echo To push changes: git push --force

del git_filter_temp.sh
