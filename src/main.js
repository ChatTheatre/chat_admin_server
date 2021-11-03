let config = undefined;

const configFilename = process.argv[0];

if(process.argv.length != 1) {
    console.log("Please specify exactly one argument, a JSON configuration file!");
    process.exit(1);
}

/**
 * Read in server configurations from the configuration file.
 */
try {
    config = JSON.parse(require('fs').readFileSync(process.argv[0]));
} catch (error) {
    console.log('Configuration file missing or improperly formatted.');
    process.exit(1);
}

const secret = config.jwt.secret;
const app_id = config.jwt.app_id;

const xmpp_domain = config.jitsi.domain;

let jwt = require('jsonwebtoken');

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
