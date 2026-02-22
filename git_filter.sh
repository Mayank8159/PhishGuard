#!/bin/sh
# Git filter script for rewriting commit times
# Base: Feb 22, 2026, 2:00 PM (timestamp: 1740240000)
# Increment: 144 seconds per commit

COMMIT_NUM=$(git rev-list --reverse HEAD | grep -n $GIT_COMMIT | cut -d: -f1)
SECONDS_OFFSET=$(( ($COMMIT_NUM - 1) * 144 ))
NEW_TIMESTAMP=$(( 1740240000 + $SECONDS_OFFSET ))
export GIT_AUTHOR_DATE="@$NEW_TIMESTAMP"
export GIT_COMMITTER_DATE="@$NEW_TIMESTAMP"
