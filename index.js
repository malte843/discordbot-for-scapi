const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

var token = process.env.TOKEN;

const {
  Client,
  Events,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Permissions,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.on("ready", () => {
  console.log("Bot is online!");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
  let gId = interaction.guildId;
  if(gId === null) {
    console.log("Command /" + interaction.commandName + " from " + interaction.user.tag + " in dm");
  } else {
    console.log("Command /" + interaction.commandName + " from " + interaction.user.tag + " in guild id " + gId);
  }  
});

client.login(token);
