#!/bin/bash

set -e

git config --global user.email "stolen3@gmail.com"
git config --global user.name "Travis-CI"
git config credential.helper "store --file=.git/credentials"
echo "https://${GH_TOKEN}:@github.com" > .git/credentials

git checkout origin master

npm run build

git add -A .
git commit -m "Updating Docs"
git push origin master