#!/bin/bash

# Make sure Jitsi is configured for a SkotOS instance.

if [ "$#" -ne 3 ]
then
  echo "Please supply exactly three arguments! configure-jitsi.sh JITSI_FQDN APP_ID APP_SECRET"
  exit -1
fi

JITSI_FQDN="$1"
APP_ID="$2"
APP_SECRET="$3"

cd /var/chat_admin_server

# Remove jitsi_host line, if any, from SkotOS instance file, then add the new one.
cat /var/skotos/skoot/usr/System/data/instance | grep -v jitsi_host > /var/skotos/skoot/usr/System/data/instance
echo "jitsi_host $JITSI_HOST" >> /var/skotos/skoot/usr/System/data/instance

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
echo "Please log into SkotOS via the telnet port and run 'code \"/usr/System/initd\`"->get_instance()'. This will re-read the instance file."

