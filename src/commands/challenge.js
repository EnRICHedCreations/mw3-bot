const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

const CLASSES = ["Assault", "SMG", "Sniper", "LMG", "Shotgun", "Marksman", "Handgun", "Launcher"];

const RESTRICTIONS = [
  "No perks allowed",
  "Iron sights only — no optic",
  "No suppressors",
  "Maximum 3 attachments",
  "You must use a stock attachment",
  "No extended magazines",
  "Lightweight setup only — no heavy barrels or grips",
  "Pistol secondary only",
  "No underbarrel attachments",
  "Must use a laser attachment",
  "One attachment only",
  "Must use the longest barrel available",
  "No stock attachment allowed",
  "Hollow point ammo only",
  "Must use a suppressor",
];

const MODES = [
  "Search & Destroy",
  "Hardpoint",
  "Domination",
  "Team Deathmatch",
  "Kill Confirmed",
  "Ranked Play",
  "Ground War",
  "Invasion",
];

const MAPS = [
  "Rust",
  "Favela",
  "Terminal",
  "Highrise",
  "Skidrow",
  "Estate",
  "Derail",
  "Karachi",
  "Sub Base",
  "Afghan",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Generate a random loadout challenge for the server"),

  async execute(interaction) {
    await interaction.deferReply();

    const weaponClass  = pick(CLASSES);
    const restriction1 = pick(RESTRICTIONS);
    const restriction2 = pick(RESTRICTIONS.filter((r) => r !== restriction1));
    const mode         = pick(MODES);
    const map          = pick(MAPS);

    const embed = new EmbedBuilder()
      .setColor(0xcc2020)
      .setTitle("🎯  LOADOUT CHALLENGE")
      .setDescription("Can you pull this off? Build the loadout and post it with `/post`.")
      .addFields(
        { name: "🔫 WEAPON CLASS",   value: weaponClass,                    inline: true },
        { name: "🗺️ MAP",            value: map,                            inline: true },
        { name: "🎮 MODE",           value: mode,                           inline: true },
        { name: "⚠️ RESTRICTION 1",  value: restriction1,                   inline: false },
        { name: "⚠️ RESTRICTION 2",  value: restriction2,                   inline: false },
        { name: "▶ HOW TO COMPLETE", value: `Build your loadout using the rules above, then submit it to the vault with \`/post\` and drop the link here.`, inline: false },
      )
      .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}  ·  Good luck, operator.` })
      .setTimestamp();

    await interaction.editReply({
      content: `@here 🎯 **New challenge from ${interaction.user.displayName}!** Think you can do it?`,
      embeds: [embed],
    });
  },
};
