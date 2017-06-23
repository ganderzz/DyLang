#!/bin/bash

set -e

DIR=./out

git config --global user.name "Travis-CI"
git config --global user.email "Travis@ci.com"
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"

git clone --branch gh-pages --depth=1 \
    https://${GH_TOKEN}:@github.com \
    $DIR

npm run build
mv ./docs/* $DIR

cd $DIR

git add .
git commit -m "Updating Docs"

git push --force --quiet "https://${GH_TOKEN}:@github.com" > /dev/null 2>&1