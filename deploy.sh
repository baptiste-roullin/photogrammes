#!/bin/sh
cd ~/dev/photogrammes
git pull origin master
git add .
git commit -m "deploy"
git push origin master
