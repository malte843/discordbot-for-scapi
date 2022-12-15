const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const request = require("request");
var debugmode = true;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("friends")
    .setDescription("Replies with Friends from specified Socialclub Profile")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the Profile to get friends from")
        .setRequired(true)
    ),
  async execute(interaction) {
    const author = interaction.user.tag;
    const name = interaction.options.getString("name");
    const apiurl = process.env.API_URL.replace(":name", name);

    const options = {
      url: apiurl,
    };
    request(options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        const info = JSON.parse(body);
        debugConsole(JSON.stringify(info));
        sendEmbed(info, author, interaction, 0);
      } else if (response.statusCode === 500) {
        interaction.reply("The player does not exist.");
        debugConsole("Command failed");
      } else {
        interaction.reply("Error! Try again in a few seconds.");
        debugConsole("Command failed");
      }
    });
    /*
    client.on(Events.InteractionCreate, btnInteraction => {
        if (!btnInteraction.isButton()) return;
        console.log(btnInteraction);
    });
    */
  },
};

function debugConsole(str) {
  if (debugmode) {
    console.log(str);
  }
}

function nullify(str) {
  if (!str) {
    return "Hidden";
  } else {
    return str;
  }
}

function sendEmbed(json, author, interaction, currentFriend) {
  const name = json.rockstarAccount.name;
  const friendsArray = json.friends;
  const thumbnailUrl = json.rockstarAccount.avatarUrl;
  var len = Object.keys(json.friends).length;

  var embedFields = [{ name: "Friends for Profile:", value: name + ` (${len} friends)` }];

  var friendCount = 0;
  var lastFriend = false;

  try {
    friendsArray.forEach((obj) => {
      if (friendCount < 5) {
        var fName = obj.name;
        var fRid = obj.rockstarId;
        const fProfileLink =
          "https://socialclub.rockstargames.com/member/" + fName;
        var field = { name: fName + ` (${fRid})`, value: fProfileLink };
        embedFields.push(field);
        friendCount++;
        if(friendCount === len) {
            lastFriend = true;
        }
      } else {
        return;
      }
    });
  } catch {
    if (!name) {
      interaction.reply("The player does not exist.");
    } else {
      interaction.reply("The player has its friends hidden.");
    }
    return;
  }

  const embed = {
    color: 0xff8800,
    title: "Socialclub Friends Lookup",
    thumbnail: {
      url: thumbnailUrl,
    },
    fields: embedFields,
    timestamp: new Date().toISOString(),
    footer: {
      text: "requested by: " + author,
    },
  };

  const btnLoadMore = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("loadMore")
      .setLabel("Load More")
      .setStyle(ButtonStyle.Success)
  );

  if(lastFriend) {
    interaction.reply({
        embeds: [embed],
      });
  } else {
    interaction.reply({
        embeds: [embed],
        //components: [btnLoadMore],
      });
  }
}

process.on("uncaughtException", function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});
