const { SlashCommandBuilder } = require("discord.js");
const supabase = require("../supabase");
const { buildStatsEmbed } = require("../embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show overall Loadout Vault stats"),

  async execute(interaction) {
    await interaction.deferReply();

    const { data, error } = await supabase
      .from("loadouts")
      .select("*");

    if (error || !data?.length) {
      return interaction.editReply("❌ Could not fetch vault stats.");
    }

    const totalLoadouts = data.length;
    const totalLikes = data.reduce((sum, l) => sum + (l.likes ?? 0), 0);
    const totalViews = data.reduce((sum, l) => sum + (l.views ?? 0), 0);

    // Top operator by submission count
    const authorCounts = data.reduce((acc, l) => {
      acc[l.author] = (acc[l.author] || 0) + 1;
      return acc;
    }, {});
    const topAuthorEntry = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0];
    const topOperator = topAuthorEntry ? { author: topAuthorEntry[0], count: topAuthorEntry[1] } : null;

    // Most liked loadout
    const topLoadout = [...data].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))[0];

    // Class breakdown
    const classCounts = data.reduce((acc, l) => {
      acc[l.weapon_class] = (acc[l.weapon_class] || 0) + 1;
      return acc;
    }, {});

    const embed = buildStatsEmbed({ totalLoadouts, totalLikes, totalViews, topOperator, topLoadout, classCounts });
    await interaction.editReply({ embeds: [embed] });
  },
};
