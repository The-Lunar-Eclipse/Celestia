import { exec } from "child_process";
import express from "express";
import tmi from "tmi.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

var token = "null";

const app = express();

var s = app.listen(3000, () => {
    console.log("\n\n~ ~ ~ CelestiaTCB Bot ~ ~ ~\n\nLocal server has started on port 3000.");
});

app.get("/", (req, res) => {
    console.log("Access token verification started.");

    const html = `
        <html>
            <body>
                <script>
                    const hash = window.location.hash.substring(1);
                    const params = new URLSearchParams(hash);
                    const accessToken = params.get('access_token');
                    window.location.href = '/access_token?token=' + accessToken;
                </script>
            </body>
        </html>
    `;

    res.send(html);
});

app.get("/access_token", (req, res) => {
    token = req.query.token;

    const html = `
        <html>
            <body>
                <h1>Access token received</h1>
                <script>
                    window.close();
                </script>
            </body>
        </html>
    `;

    res.send(html);
});

(() => {
    exec(`start chrome --new-window --Celestia "https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${process.env.CLIENT_ID}&redirect_uri=http://localhost:3000&scope=chat:read+chat:edit&state=c3ab8aa609ea11e793ae92361f002671"`)
})();

var a = setInterval(() => {
    if(token !== "null")
    {
        (async () => {
            const response = await axios.get('https://id.twitch.tv/oauth2/validate', {
                headers: {
                    'Authorization': `OAuth ${token}`
                }
            });

            if(response.status === 200)
                startCelestia(token, response.data);
            else
            {
                console.log("Error validating token");
                s.close();

                console.log("Local server closed due to token validation error.");
                process.exit(1);
            }
        })();

        s.close();
        console.log("Local server closed due to token being received.");
        clearInterval(a);
    }
}, 5000)

function startCelestia(token, data)
{
    const options =
    {
        identity: {
            username: "CelestiaTCB",
            password: "oauth:" + token
        },
        channels: [ "lunardemimoon" ]
    }

    const client = new tmi.client(options);

    client.on("message", onMessageHndl);
    client.on("connected", () => { console.log(`Successfully Connected to Twitch with user ${data.login} to ${options.channels[0]}'s stream!`); })
    client.connect().catch(console.log);

    var messageCount = 0;
    function onMessageHndl(target, context, message, self)
    {
        if (self) return;
        messageCount++;

        const cmdName = message.trim();

        switch(cmdName)
        {
            case "!whoarethey?":
            {
                client.say(target, "Curious about my children, are thou? I would be ever so happy to assist you in getting to know them, you may visit this link to find out more! http://thelunareclipse.site")
                console.log("\n ~ ~ ~ ~ ~ Command Executed ~ ~ ~ ~ ~\n\nCommandName: " + cmdName + "\nExecuted by: " + context.username + `\nTimestamp: ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}` +"\n\n~ ~ ~ End of Command Execution ~ ~ ~\n");
                break;
            }

            case "!boop":
            {
                client.say(target, `HOW DARETH THOU BOOPETH ME! I AM THE PRINCESS OF THE DAY! I SHALL BOOPETH THEE BACK! BOOP!!!`);
                console.log("\n ~ ~ ~ ~ ~ Command Executed ~ ~ ~ ~ ~\n\nCommandName: " + cmdName + "\nExecuted by: " + context.username + `\nTimestamp: ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}` +"\n\n~ ~ ~ End of Command Execution ~ ~ ~\n");
                break;
            }
        }
    }

    const messageDenote = 10;
    const offsetTime = 600000;
    setInterval(() => {
        if(messageCount >= messageDenote)
        {
            client.say(options.channels[0], "Hello everypony! If you are interested in learning more about my children or are interested in supporting them, you may visit this link to find more! http://thelunareclipse.site (Powered by Lunar Moon).")
            console.log(`CLIENT_MSG Sent: The criteria (MSG-${messageDenote}, MS-${offsetTime}) was met, sent 'PROMO MESSAGE.'\nMessage count has been reset to 0 as a result of 'CRITERIA MET.'`);

            messageCount = 0;
        }
    }, offsetTime)
}