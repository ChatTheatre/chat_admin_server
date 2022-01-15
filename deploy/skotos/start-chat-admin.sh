#!/bin/bash

set -e
set -x

# This script is meant to start the chat_admin_server for a SkotOS deploy

cd /var/chat_admin_server

# Does it say not to start the server? If we shouldn't start it, just quit.
if [ -f NO_START.txt ]
then
  exit 0
fi

# Already running? Then don't run it, just quit.
pgrep -f "chat_admin_config.json" && exit 0

node src/main.js ./chat_admin_config.json

