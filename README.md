# Discordbot for Socialclub API

### This was build using nodejs v16.17.1

To use this you need https://github.com/jdjdpsjsjdlsk/rsg-socialclub-api setup.

### Setup:
```
git clone https://github.com/jdjdpsjsjdlsk/discordbot-for-scapi.git
cd discordbot-for-scapi
npm install
```

Rename .env.example to .env and fill your Bottoken TOKEN, CLIENTID and the url+port from your api if you changed it.

For first start run `node deploy-commands.js` or `npm run updateCommands` to register commands to discord. You only need to do this once or if you happen to add commands or change description or something.

Start the script with `npm run start` or `node .` and wait for the message that says `Bot is online!`

To test the bot run `/rid [player]` on discord server where your bot is in.

Commands also work in dm with bot

### Preview of `/rid` command:

![RID Bot](https://user-images.githubusercontent.com/41925758/207939713-ec1acebd-5905-49ed-ab8b-4b90a7361adf.PNG)
