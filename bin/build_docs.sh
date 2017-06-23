#!/bin/bash

set -e

REPO=`git config remote.origin.url`

npm run build

git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"

git add -A .
git commit -m "Updating Docs"
git push origin master