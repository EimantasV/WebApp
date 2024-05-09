const { EthernetConnection } = require("./ethernetConnection.js");
const { ServerHTTPS } = require("./serverHTTPS.js");
const { ServerWSS } = require("./serverWSS.js");
const { ServerUDP } = require("./serverUDP.js");

const main = async () => {
    await EthernetConnection.waitForConnection();
    ServerHTTPS.start();
    ServerWSS.start({ serverHTTPS: ServerHTTPS.server, sendUDP: ServerUDP.send });

};
main();