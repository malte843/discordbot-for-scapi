const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const request = require("request");
var debugmode = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rid")
    .setDescription("Replies with Profileinfo for specified Socialclub Profile")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the Profile to get info from")
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
        sendEmbed(info, author, interaction);
      } else if (response.statusCode === 500) {
        interaction.reply("The player does not exist.");
        debugConsole("Command failed");
      } else {
        interaction.reply("Error! Try again in a few seconds.");
        debugConsole("Command failed");
      }
    });
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

function sendEmbed(json, author, interaction) {
  const name = json.rockstarAccount.name;
  const profileLink = "https://socialclub.rockstargames.com/member/" + name;

  const thumbnailUrl = nullify(json.rockstarAccount.avatarUrl);
  const rid = nullify(json.rockstarAccount.rockstarId);
  const crewName = nullify(json.rockstarAccount.primaryClanName);
  const crewId = nullify(json.rockstarAccount.primaryClanId);
  const crewTag = nullify(json.rockstarAccount.primaryClanTag);
  const crewColor = nullify(json.rockstarAccount.primaryClanColor);
  const countryCode = nullify(json.rockstarAccount.countryCode);
  const profileHidden = json.rockstarAccount.profileHidden;
  const friendsHidden = json.rockstarAccount.friendsHidden;
  const friendsCount = nullify(json.rockstarAccount.friendCount);
  const lastPlayedOn = nullify(json.rockstarAccount.lastUgcPlatform);
  const lastPlayedGame = nullify(json.rockstarAccount.lastUgcTitle);
  if (!lastPlayedGame === "Hidden") {
    lastPlayedGame = lastPlayedGame.toUpperCase();
  }
  const wallPosts = json.rockstarAccount.allowWallPost;
  const wallHidden = json.rockstarAccount.wallHidden;
  const allowStatCompare = json.rockstarAccount.allowStatCompare;
  const allowBlock = json.rockstarAccount.allowBlock;
  const allowReport = json.rockstarAccount.allowReport;
  const gamesOwnedArray = json.rockstarAccount.gamesOwned;
  const linkedAccountsArray = json.linkedAccounts;
  var gamesOwned = "";
  var linkedAccounts = "";

  /*
  for(i = 0; i < gamesOwnedArray.size(); i++) {
    gamesOwned += "\n" + gamesOwnedArray[i];
  }
  for(i = 0; i < linkedAccountsArray.size(); i++) {
    linkedAccounts += "\n" + linkedAccountsArray[i];
  }
  */

  try {
    gamesOwnedArray.forEach((obj) => {
      gamesOwned += "\n" + obj.name;
    });
  } catch {
    gamesOwned = "Hidden";
  }

  try {
    linkedAccountsArray.forEach((obj) => {
      linkedAccounts += "\n" + obj.onlineServiceDisplayName;
    });
  } catch {
    linkedAccounts = "Hidden";
  }

  gamesOwned = nullify(gamesOwned);
  linkedAccounts = nullify(linkedAccounts);

  const embed = {
    color: 0xff8800,
    title: "Socialclub RID Lookup",
    thumbnail: {
      url: thumbnailUrl,
    },
    fields: [
      {
        name: "Profile",
        value: name,
        inline: false,
      },
      {
        name: "RockstarId",
        value: rid,
        inline: true,
      },
      {
        name: "Countrycode",
        value: countryCode + " :flag_" + countryCode.toLowerCase() + ":",
        inline: true,
      },
      {
        name: "Crewname",
        value: crewName,
        inline: true,
      },
      {
        name: "CrewID",
        value: crewId,
        inline: true,
      },
      {
        name: "Crewtag",
        value: crewTag,
        inline: true,
      },
      {
        name: "Crewcolor",
        value: crewColor,
        inline: true,
      },
      {
        name: "Profile hidden",
        value: profileHidden,
        inline: true,
      },
      {
        name: "Friends hidden",
        value: friendsHidden,
        inline: true,
      },
      {
        name: "Friends count",
        value: friendsCount,
        inline: true,
      },
      {
        name: "Last played on",
        value: lastPlayedOn,
        inline: true,
      },
      {
        name: "Wall hidden",
        value: wallHidden,
        inline: true,
      },
      {
        name: "Last played game",
        value: lastPlayedGame,
        inline: true,
      },
      {
        name: "Allow Wall posts",
        value: wallPosts,
        inline: true,
      },
      {
        name: "Allow Stat compare",
        value: allowStatCompare,
        inline: true,
      },
      {
        name: "Allow block",
        value: allowBlock,
        inline: true,
      },
      {
        name: "Allow report",
        value: allowReport,
        inline: true,
      },
      {
        name: "Games owned",
        value: gamesOwned,
        inline: true,
      },
      {
        name: "Linked Accounts",
        value: linkedAccounts,
        inline: true,
      },
      {
        name: "Profile link",
        value: profileLink,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "requested by: " + author,
    },
  };

  interaction.reply({
    embeds: [embed],
  });
}

process.on("uncaughtException", function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});
