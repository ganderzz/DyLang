#!/bin/bash

set -e

git config --global user.name "Travis-CI"
git config credential.helper "store --file=.git/credentials"
echo "https://${GH_TOKEN}:@github.com" > .git/credentials

git branch
git pull origin gh-pages
git branch
git checkout gh-pages

npm run build

ls

git add .
git commit -m "Updating Docs"
git push origin gh-pages