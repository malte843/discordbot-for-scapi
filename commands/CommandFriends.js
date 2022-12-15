const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const request = require("request");
var debugmode = false;
var firstMsg = true;

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

    var friendCount = 0;

    const options = {
      url: apiurl,
    };
    request(options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        const info = JSON.parse(body);
        debugConsole(JSON.stringify(info));
        friendCount = sendEmbed(info, author, interaction, 0);

        if (friendCount != 0) {
          const filter = (click) => click.user.id === interaction.user.id;
          const collector = interaction.channel.createMessageComponentCollector(
            {
              max: "1", // The number of times a user can click on the button
              time: "60000", // The amount of time the collector is valid for in milliseconds,
              filter, // Add the filter
            }
          );

          collector.on("collect", (interaction) => {
            friendCount = sendEmbed(info, author, interaction, friendCount);
          });

          collector.on("end", (collected) => {
            console.log(`Collected ${collected.size} clicks`); // Run a piece of code when the collector ends
          });
        }
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
  var len = 0;
  var len1 = 0;
  try {
    len1 = Object.keys(json.friends).length;
  } catch {
    len1 = 0;
  }

  var friendCount = 0;
  var mFriendCount = 0;
  var lastFriend = false;

  var embedFields = [
    { name: "Friends for Profile:", value: name + ` (${len1} friends)` },
  ];

  try {
    len = Object.keys(json.friends).length;
    friendsArray.forEach((obj, index) => {
      if (mFriendCount < 15) {
        if (index >= currentFriend) {
          var fName = obj.name;
          var fRid = obj.rockstarId;
          const fProfileLink =
            "https://socialclub.rockstargames.com/member/" + fName;
          var field = { name: fName + ` (${fRid})`, value: fProfileLink };
          embedFields.push(field);
          friendCount++;
          mFriendCount++;
        }
        if (friendCount === len) {
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

  if (len === 0) {
    interaction.reply("The player has its friends hidden.");
    return 0;
  }
  if (lastFriend) {
    interaction.reply({
      embeds: [embed],
    });
    friendCount = 0;
  } else {
    if (firstMsg) {
      interaction.reply({
        embeds: [embed],
        components: [btnLoadMore],
      });
      firstMsg = false;
    } else {
      interaction.reply({
        embeds: [embed],
      });
      friendCount = 0;
    }
  }

  mFriendCount = 0;
  return friendCount;
}

process.on("uncaughtException", function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});
