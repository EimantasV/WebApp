const {EthernetConnection} = require("./ethernetConnection.js");


const main = async () =>
{
    await EthernetConnection.waitForConnection();
};
main();