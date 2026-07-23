const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

const CLASSES = ["Assault", "SMG", "Sniper", "LMG", "Shotgun", "Marksman", "Handgun", "Launcher"];

const WEAPON_CLASS_COLORS = {
  Assault: 0xcc2020, SMG: 0xd4691e, Sniper: 0xc8a228, LMG: 0xb83232,
  Shotgun: 0x6a4faa, Marksman: 0x2a8a7a, Handgun: 0x5a7aaa, Launcher: 0xaa5a2a,
};

const CLASS_ICONS = {
  Assault: "🟢", SMG: "🟠", Sniper: "🟡", LMG: "🔴",
  Shotgun: "🟣", Marksman: "🔵", Handgun: "🩵", Launcher: "🟤",
};

const FLAVOR = {
  Assault:  "Time to lock down the mid.",
  SMG:      "Get up close and personal.",
  Sniper:   "Patience is a weapon.",
  LMG:      "Spray and pray... strategically.",
  Shotgun:  "No one gets through.",
  Marksman: "Precision over power.",
  Handgun:  "No excuses. Make it work.",
  Launcher: "Let chaos reign.",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Can't decide what to run? Let the vault pick your weapon class"),

  async execute(interaction) {
    await interaction.deferReply();

    const rolled = CLASSES[Math.floor(Math.random() * CLASSES.length)];
    const icon   = CLASS_ICONS[rolled] || "🎲";
    const flavor = FLAVOR[rolled] || "Good luck, operator.";
    const color  = WEAPON_CLASS_COLORS[rolled] || 0xcc2020;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${icon}  YOU'RE RUNNING ${rolled.toUpperCase()}`)
      .setDescription(`*${flavor}*`)
      .addFields(
        { name: "▶ NEXT STEP", value: `Browse **${rolled}** builds for inspiration with \`/class ${rolled}\`, then submit yours with \`/post\`.` }
      )
      .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
      .setTimestamp();

    await interaction.editReply({
      content: `🎲 **${interaction.user.displayName}** rolled the dice...`,
      embeds: [embed],
    });
  },
};
