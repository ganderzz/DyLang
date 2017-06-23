#!/bin/bash

npm run build
git add -A
git commit -m "Update Docs"
git push origin master