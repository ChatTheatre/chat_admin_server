# Chat Admin Server

This is a Chat Admin Server, designed to facilitate a scalable, room-based chat server with limited overhead, based on Jitsi and similar free and open-source software.

Using Jitsi with JWT and token_moderation, it's possible to avoid the default Jitsi setup where a single in-room user is automatically made a moderator. That's good! You don't want them to be able to forcibly kick out later users.

In order to make this work, you'll want to automatically assign JWT tokens for different channels that permit using them, but don't permit becoming moderator. The Chat Admin Server is designed to let other programs create single-channel non-admin tokens repeatedly, on demand, with configurable duration.

## Usage

You'll need a configuration file. See config-example.json in the top-level directory. If you're using Chat Admin Server for a new project you probably want to configure the "inbound" entry to the port number you'll be using locally. Note that this port should be protected by a firewall - CAS does *not* have useful security, so you shouldn't allow remote connections.

If the app ID and app secret are wrong, Jitsi won't accept your JWT tokens as valid and you can't log in. You can verify the app ID and app secret in your prosody configuration file on the Jitsi server. You can also find the Jitsi XMPP domain there (often "meet.jitsi", but sometimes the FQDN of your server.)

If you skip the incoming or outgoing section of the configuration file, you won't get both -- just the one you include. If you skip both, CAS won't start because it's useless without some interface.

If you're using CAS for a DGD server like vRWOT or a SkotOS game, you'll want to start from the automatic configuration you already have.

## SkotOS

The Chat Admin Server is a by-product of [vRWOT](https://github.com/WebOfTrustInfo/prototype_vRWOT) and [SkotOS](https://github.com/ChatTheatre/SkotOS), allowing a game/conference server to control access to Jitsi rooms as a game mechanic.

In these cases you want to carefully restrict access to most channels.

This is also the purpose of the "outbound" configuration option, since DGD servers do not normally make their own outgoing connections for security reasons.

## Jitsi Installation

Jitsi should be installed with JWT authorisation. See:

* https://meetrix.io/blog/webrtc/jitsi/meet/how-to-authenticate-users-to-Jitsi-meet-using-JWT-tokens.html
* https://doganbros.com/index.php/jitsi/jitsi-installation-with-jwt-support-on-ubuntu-20-04-lts/

You should also install the token_moderation plugin. See:

* https://github.com/nvonahsen/jitsi-token-moderation-plugin

Note that you'll need to follow the existing naming convention for plugins for your Jitsi installation when you install token_moderation.

## Protocol

CAS reads a JSON object followed by a NUL character (a.k.a. null byte) or newline. It should be a single object with some or all of the following fields:

* cmd (string, usually "jwt_token")
* displayName (string)
* email (string)
* channel (string, can be "\*" for all channels)
* moderator (boolean)
* avatar (URL string)
* validUntil (integer)

The email and avatar fields are optional. The others are mandatory.

The response will be another length-tagged JSON object with the following fields:

* success (boolean)
* message (string, usually "OK" or an error)
* token (string, the new JWT token or empty)
* time (integer, current server time)

