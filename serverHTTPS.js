class ServerHTTPS
{
    //includes
    static express;
    static path;
    static https;
    static fs;
    static dgram;


    //other
    static app;
    static port = 3000;


    static privateKey;
    static certificate;
    static credentials;


    static server;

    static {
        this.express = require("express");
        this.path = require("path");
        this.https = require("https");
        this.fs = require("fs");
        this.dgram = require('dgram');


    }

    static start()
    {
        this.privateKey = this.fs.readFileSync("./key.pem", "utf8");
        this.certificate = this.fs.readFileSync("./cert.pem", "utf8");
        this.credentials = { key: this.privateKey, cert: this.certificate, passphrase: "1234" };

        this.app = this.express();
        this.server = this.https.createServer(credentials, app);

        app.use(express.static(path.join(__dirname, "src")));

        server.listen(port, () =>
        {
          console.log(`Server is running on https://localhost:${port}`);
        });
    }


}

exports.ServerHTTPS = ServerHTTPS;

