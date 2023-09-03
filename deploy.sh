#!/bin/sh
cd ~/dev/photogrammes
git pull prod origin
git add .
git commit -m "deploy"
git push prod master
