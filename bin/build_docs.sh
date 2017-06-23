#!/bin/bash

set -e

git config --global user.email "stolen3@gmail.com"
git config --global user.name "Travis-CI"

npm run build

git add -A .
git commit -m "Updating Docs"
git push origin master