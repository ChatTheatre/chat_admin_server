let config = undefined;

const myArgs = process.argv.slice(2);
const configFilename = myArgs[0];

if(myArgs.length != 1) {
    console.log("Please specify exactly one argument, a JSON configuration file!");
    process.exit(1);
}

/**
 * Read in server configurations from the configuration file.
 */
try {
    config = JSON.parse(require('fs').readFileSync(configFilename));
} catch (error) {
    console.log('Configuration file missing or improperly formatted.');
    console.log(error);
    process.exit(1);
}

if(!config.inbound && !config.outbound) {
    // No connections or sockets set up - die.
    console.log("Configuration file does not include 'inbound' or 'outbound' - stopping.")
    process.exit(1);
}

let myLogger = new require('./Logger')();
const secret = config.jwt.secret;
const app_id = config.jwt.app_id;

const xmpp_domain = config.jitsi.domain;

let jwt = require('jsonwebtoken');
let net = require('net');

let Listener = function(conn) {
    var myConn = conn;
    var buffer = "";
    return {
        error: function(event) {
            myLogger.log("CAS connection error: " + event);
        },
        close: function(event) {
            myLogger.log("CAS connection closed: " + event);
        },
        data: function(data) {
            //myLogger.log("Data: ///" + data + "///");
            buffer += data;

            var chunks = buffer.split("\0");
            buffer = chunks.pop(); /* Keep any trailing chars for next time */

            /* Any non-empty NUL-delimited messages that are complete will get processed. */
            var msgs = [];
            chunks.forEach((msg) => {
                if(msg == "") return;
                msgs.push(msg);
            });

            msgs.forEach((msg) => {
                var d;
                try {
                    d = JSON.parse(msg);
                } catch(error) {
                    console.log("error parsing message", msg);
                    console.log("JSON error:", error);
                    return;
                }
                var encodeable = {
                    "context": {
                        "user": d.displayName
                    },
                    "moderator": d.moderator,
                    "aud": "jitsi",
                    "iss": config.jwt.app_id,
                    "sub": config.jitsi.domain,
                    "room": d.channel,
                };
                if(d.validUntil) {
                    encodeable.exp = d.validUntil;
                } else if (d.validFor) {
                    encodeable.expiresIn = parseInt(d.validFor);
                }
                if(d.email) {
                    encodeable.context.email = d.email;
                }
                if(d.avatar) {
                    encodeable.context.avatar = d.avatar;
                }
                //console.log("Encoding JWT with", encodeable);
                var signature = jwt.sign(encodeable, config.jwt.secret);

                var retVal = {
                    "success": true,
                    "message": "OK",
                    "token": signature,
                    "time": parseInt(Date.now() / 1000),
                    "seq": d.seq,
                };
                //console.log("Returning value with JWT token: " + signature);
                console.log("Returning token for user " + d.displayName + " room " + d.channel + "...");
                myConn.write(JSON.stringify(retVal) + '\n\0'); /* Newline in case of line-oriented receiver :-( */
            });
        },
    }
};

if(config.inbound) {
    let server = net.createServer(function(socket) {
        console.log("New connection...")
        var connListener = new Listener(socket);
        socket.on('error', (event) => { connListener.error(event); });
        socket.on('close', (event) => { connListener.close(event); });
        socket.on('data', (data) => { connListener.data(data.toString()); });
    });
    server.listen(config.inbound.port, config.inbound.host, function (socket) {
        console.log("Server listening on port " + config.inbound.port + " (inbound)");
    });
}
if(config.outbound) {
    let socket = new net.Socket();
    let outboundListener = new Listener(socket);
    socket.connect(config.outbound.port, config.outbound.host, function() {
        console.log("CAS outbound connection established to " + config.outbound.host + " port " + config.outbound.port);
    });
    socket.on('data', function(data) {
        outboundListener.data(data);
    });
    socket.on('error', function(event) {
        outboundListener.error(event);
    });
    socket.on('close', function(event) {
        outboundListener.close(event);
        // TODO: reconnect
    });
}

// See: https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/tokens.md
//   and/or: https://meetrix.io/blog/webrtc/jitsi/meet/how-to-authenticate-users-to-Jitsi-meet-using-JWT-tokens.html
// let payload = {
//   "context": {
//     "user": {
//       "name": "your_client_name",
//       "email": "your_client_email"
//     }
//   },
//   "moderator": false,
//   "aud": "jitsi", // Required?
//   "iss": app_id,
//   "sub": xmpp_domain,
//   "room": "*",
//   "exp": 1643498815  // Expiration as Unix timestamp
// }
// jwt.sign(payload, secret)
