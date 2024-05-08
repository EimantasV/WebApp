const {EthernetConnection} = require("./ethernetConnection.js");
const {ServerHTTPS} = require("./serverHTTPS.js");

const main = async () =>
{
    await EthernetConnection.waitForConnection();
    ServerHTTPS.start();
    console.log("Im here");
};
main();