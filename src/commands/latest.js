const { SlashCommandBuilder } = require("discord.js");
const supabase = require("../supabase");
const { buildLoadoutEmbed } = require("../embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("latest")
    .setDescription("Show the most recently submitted loadout from the vault"),

  async execute(interaction) {
    await interaction.deferReply();

    const { data, error } = await supabase
      .from("loadouts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return interaction.editReply("❌ No loadouts found in the vault.");
    }

    const embed = buildLoadoutEmbed(data);
    await interaction.editReply({ embeds: [embed] });
  },
};
