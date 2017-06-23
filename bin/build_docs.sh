#!/bin/bash

set -e

DIR=./out

git config --global user.name "Travis-CI"
git config --global user.email "Travis@ci.com"
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git config credential.helper "store --file=.git/credentials"
echo "https://${GH_TOKEN}:@github.com" > .git/credentials

npm run build
cd ./docs

git init
git remote add origin https://github.com/ganderzz/DyLang.git
git fetch
git checkout -t origin/gh-pages

git add .
git commit -m "Updating Docs"

git branch
git push --force --quiet