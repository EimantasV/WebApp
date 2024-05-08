class EthernetConnection
{
    static executeCommand(command)
    {
        const { exec } = require('child_process');
        return new Promise((resolve, reject) =>
        {
            exec(command, (error, stdout, stderr) =>
            {
                if (error)
                {
                    reject(error);
                    return;
                }
                resolve({ stdout, stderr });
            });
        });
    }

    static async ping()
    {
        const pingCommand = "ping -S 192.168.0.1 -w 300 -n 1 192.168.0.2";
        const { stdout } = await this.executeCommand(pingCommand);
        console.log(stdout);
        if (stdout.includes("Reply from 192.168.0.2"))
        {
            console.log("Mobile device is connected over Ethernet");
            return true;
        }
        else
        {
            console.log("Mobile device is NOT connected over Ethernet");
            return false;
        }
    }

    static async status()
    {
        try
        {
            const res = await this.ping();
            if(!res)
            {
                const restartCommand = "netsh interface set interface Ethernet admin=disable && netsh interface set interface Ethernet admin=enable";
                const { stdout } = await executeCommand(restartCommand);
                console.log(stdout);
                console.log("Ethernet interface restarted successfully");
                return false;
            }
        }
        catch (error)
        {
            console.log(error);
        }
    }
}


const main = async () =>
{
    const connectionStatus = await EthernetConnection.status();
    console.log(connectionStatus);
};