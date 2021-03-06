#!/bin/bash

# Make sure Jitsi is configured for a SkotOS instance.

set -e

if [ "$#" -ne 3 ]
then
  echo "Please supply exactly three arguments! configure-jitsi.sh JITSI_FQDN APP_ID APP_SECRET"
  exit -1
fi

JITSI_FQDN="$1"
APP_ID="$2"
APP_SECRET="$3"

INSTANCE_FILE=/var/game/.root/usr/System/data/instance

cd /var/chat_admin_server

# Remove jitsi_host line, if any, from SkotOS instance file, then add the new one.
cat $INSTANCE_FILE | grep -v jitsi_host > /tmp/instance_file
mv /tmp/instance_file $INSTANCE_FILE
echo "jitsi_host $JITSI_FQDN" >> $INSTANCE_FILE

cat >/var/chat_admin_server/chat_admin_config.json <<EndOfJSON
{
    "jitsi": {
        "domain": "$JITSI_FQDN"
    },
    "jwt": {
        "app_id": "$APP_ID",
        "secret": "$APP_SECRET"
    },
    "outbound": {
        "host": "127.0.0.1",
        "port": 11091
    }
}
EndOfJSON

rm -f NO_START.txt # Cron should restart chat_admin_server, once we kill it.
# Chat_admin_server running? Kill it.
pgrep -f "chat_admin_config.json" && kill -9 `pgrep -f chat_admin_config.json` || echo "OK..."

# We don't have the SkotOS password, so we can't just do this for ourselves.
echo "Please log into SkotOS via the telnet port and run 'code \"/usr/System/initd\"->get_instance()'. This will re-read the instance file."

