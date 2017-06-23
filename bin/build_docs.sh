#!/bin/bash

set -e

REPO=`git config remote.origin.url`

npm run build

git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"

if ! git diff-index --quiet HEAD --; then
    git add -A .
    git commit -m "Updating Docs"
    git push origin master
fi