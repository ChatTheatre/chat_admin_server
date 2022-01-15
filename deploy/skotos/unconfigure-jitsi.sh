#!/bin/bash

# Make sure Jitsi isn't configured for a SkotOS instance.

cd /var/chat_admin_server
touch NO_START.txt # Cron shouldn't restart the server once it's dead.

# Chat_admin_server running? Kill it.
pgrep -f "chat_admin_config.json" && kill -9 `pgrep -f chat_admin_config.json` || echo "OK..."

INSTANCE_FILE=/var/game/.root/usr/System/data/instance

# Remove jitsi_host line, if any, from SkotOS instance file
cat $INSTANCE_FILE | grep -v jitsi_host > $INSTANCE_FILE

# We don't have the SkotOS password, so we can't just do this for ourselves.
echo "Please log into SkotOS via the telnet port and run 'code \"/usr/System/initd\"->get_instance()'. This will re-read the instance file."

