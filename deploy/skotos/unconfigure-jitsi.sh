#!/bin/bash

# Make sure Jitsi isn't configured for a SkotOS instance.

cd /var/chat_admin_server
touch NO_START.txt # Cron shouldn't restart the server once it's dead.

# Chat_admin_server running? Kill it.
pgrep -f "chat_admin_config.json" && kill -9 `pgrep -f chat_admin_config.json` || echo "OK..."

# Remove jitsi_host line, if any, from SkotOS instance file
cat /var/skotos/skoot/usr/System/data/instance | grep -v jitsi_host > /var/skotos/skoot/usr/System/data/instance

# We don't have the SkotOS password, so we can't just do this for ourselves.
echo "Please log into SkotOS via the telnet port, cd into /usr/System, and then compile initd.c. This will re-read the instance file."
