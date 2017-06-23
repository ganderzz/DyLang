#!/bin/bash

npm run build
git add ./docs
git commit -m "Update Docs"
git push origin master