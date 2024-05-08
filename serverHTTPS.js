const express = require("express");
const path = require("path");
const https = require("https");
const fs = require("fs");
const { WebSocketServer } = require("ws");
const dgram = require('dgram');


const app = express();
const port = 3000;

const privateKey = fs.readFileSync("./key.pem", "utf8");
const certificate = fs.readFileSync("./cert.pem", "utf8");
const credentials = { key: privateKey, cert: certificate, passphrase: "1234" };

const udpclient = dgram.createSocket('udp4');