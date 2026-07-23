const { SlashCommandBuilder } = require("discord.js");
const supabase = require("../supabase");
const { buildLoadoutEmbed } = require("../embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random")
    .setDescription("Pull a random loadout from the vault"),

  async execute(interaction) {
    await interaction.deferReply();

    const { data, error } = await supabase
      .from("loadouts")
      .select("*");

    if (error || !data?.length) {
      return interaction.editReply("❌ No loadouts found in the vault.");
    }

    const random = data[Math.floor(Math.random() * data.length)];
    const embed = buildLoadoutEmbed(random);

    await interaction.editReply({
      content: "🎲 **Random loadout from the vault:**",
      embeds: [embed],
    });
  },
};
