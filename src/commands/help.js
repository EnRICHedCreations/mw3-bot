const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available MW3 Loadout Vault bot commands"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor(0xcc2020)
      .setTitle("◈  MW3 LOADOUT VAULT — BOT COMMANDS")
      .setURL(SITE_URL)
      .setDescription(`All commands for the [MW3 Loadout Vault](${SITE_URL}). Run \`/link\` first before posting loadouts.`)
      .addFields(
        {
          name: "🔗 ACCOUNT",
          value: [
            "`/link <username>` — Link your Discord to your Loadout Vault profile",
            "`/unlink` — Remove your Discord link",
            "`/whoami` — Check which profile you're linked to",
          ].join("\n"),
        },
        {
          name: "🔫 LOADOUTS",
          value: [
            "`/post` — Submit a loadout (requires `/link`) — each attachment has its own slot",
            "`/latest` — Most recently submitted loadout",
            "`/search <query>` — Search by name, author, class, or attachment",
            "`/top [sort] [class]` — Top 5 by likes or views",
            "`/random` — Pull a random loadout from the vault",
            "`/featured` — Most liked loadout this week",
            "`/class <name>` — Top 3 loadouts for a specific weapon class",
            "`/mine` — Your own submitted loadouts",
            "`/delete <name>` — Delete one of your loadouts",
          ].join("\n"),
        },
        {
          name: "👤 PROFILES",
          value: [
            "`/profile <username>` — View an operator's profile and stats",
            "`/compare <user1> <user2>` — Side by side stat comparison",
            "`/leaderboard` — Top 5 operators ranked by total likes",
          ].join("\n"),
        },
        {
          name: "📊 COMMUNITY",
          value: [
            "`/meta` — Most popular weapon classes this week",
            "`/stats` — Overall vault stats",
            "`/classes` — All weapon classes with build counts and a bar chart",
            "`/challenge` — Generate a random loadout challenge for the server",
            "`/roll` — Randomly pick a weapon class when you can't decide",
          ].join("\n"),
        },
        {
          name: "▶ GETTING STARTED",
          value: [
            `1. Create an account at **${SITE_URL}**`,
            `2. Run \`/link <your username>\` to connect your Discord`,
            `3. Use \`/post\` to submit loadouts directly from Discord`,
            `4. Browse the vault at **${SITE_URL}/loadoutvault**`,
          ].join("\n"),
        },
      )
      .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
