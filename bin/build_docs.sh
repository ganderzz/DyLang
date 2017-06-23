#!/bin/bash

set -e

REPO=`git config remote.origin.url`

npm run build

git add -A .
git commit -m "Updating Docs"
git push origin master