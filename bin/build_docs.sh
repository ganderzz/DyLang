#!/bin/bash

set -e

mkdir ../docs
pushd ../docs

git init
git remote add origin https://github.com/ganderzz/DyLang.git
git fetch
git branch
git checkout -t origin/gh-pages || exit 0;

git config --global user.name "Travis-CI"
git config --global user.email "Travis@ci.com"
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git config credential.helper "store --file=.git/credentials"
echo "https://${GH_TOKEN}:@github.com" > .git/credentials

popd
npm run build
pushd ../docs

git add .
git commit -m "Updating Docs"

git branch
git push --force --quiet