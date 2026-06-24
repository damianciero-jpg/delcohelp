#!/bin/bash

echo " EDGE Production Deploy"

# Check branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" != "main" ]; then
  echo "❌ You are NOT on main (current: $BRANCH)"
  echo " Switch to main before deploying"
  exit 1
fi

# Show changes
echo ""
echo " Changes to be deployed:"
git status
echo ""
git diff --stat

# Confirm
echo ""
read -p "⚠️ Deploy to production? (y/n): " confirm

if [ "$confirm" != "y" ]; then
  echo "❌ Deployment cancelled"
  exit 1
fi

# Add + commit
git add .

read -p " Enter commit message: " msg
if [ -z "$msg" ]; then
  msg="prod update"
fi

git commit -m "$msg"

# Push
git push origin main

echo ""
echo "✅ Deployed to production"
