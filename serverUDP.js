class ServerUDP
{
    static dgram;
    static udpclient;

    static {
        this.dgram = require('dgram');
        this.udpclient = this.dgram.createSocket('udp4');
    }

    static send(data)
    {
        this.udpclient.send(`${data}`, 12345, "192.168.0.2", (error) =>
        {
            if (error)
            {
                console.error(`Error sending message: ${error}`);
            } 
            else
            {
                console.log(`Message sent to '192.168.0.2:12345': ${data}`);
            }
        });
    }
}

exports.ServerUDP = ServerUDP;