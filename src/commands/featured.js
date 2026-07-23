const { SlashCommandBuilder } = require("discord.js");
const supabase = require("../supabase");
const { buildLoadoutEmbed } = require("../embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("featured")
    .setDescription("Show the most liked loadout this week"),

  async execute(interaction) {
    await interaction.deferReply();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("loadouts")
      .select("*")
      .gte("created_at", oneWeekAgo.toISOString())
      .order("likes", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      // Fall back to all-time most liked if nothing this week
      const { data: fallback, error: fallbackError } = await supabase
        .from("loadouts")
        .select("*")
        .order("likes", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fallbackError || !fallback) {
        return interaction.editReply("❌ No loadouts found in the vault.");
      }

      const embed = buildLoadoutEmbed(fallback);
      return interaction.editReply({
        content: "⭐ **ALL-TIME FEATURED LOADOUT** — No submissions this week, here's the all-time top:",
        embeds: [embed],
      });
    }

    const embed = buildLoadoutEmbed(data);
    await interaction.editReply({
      content: "⭐ **FEATURED LOADOUT OF THE WEEK:**",
      embeds: [embed],
    });
  },
};
