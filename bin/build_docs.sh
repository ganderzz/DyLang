#!/bin/bash

set -e

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    echo "Not building on pull requests"
    exit 0
fi

REPO=`git config remote.origin.url`

if [ -d out ]; then
    pushd out
    git pull origin master
    popd
else
    git clone $REPO out
fi


pushd out

npm run build

git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"

if ! git diff-index --quiet HEAD --; then
    git add -A .
    git commit -m "Updating Docs"
    git push origin master
fi