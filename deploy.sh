#!/bin/sh
cd ~/dev/photogrammes
git pull prod master
git add .
git commit -m "deploy"
git push prod master
