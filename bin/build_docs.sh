#!/bin/bash

set -e

git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"

rm -rf out || exit 0;
mkdir out
npm run build
mv ./docs/* ./out

pushd out
git init

git config --global user.name "Travis-CI"
git config --global user.email "Travis@ci.com"

git add .
git commit -m "Updating Docs"

git push --force --quiet "https://${GH_TOKEN}:@github.com" master:gh-pages > /dev/null 2>&1