const { SlashCommandBuilder } = require("discord.js");
const supabase = require("../supabase");
const { buildLoadoutEmbed } = require("../embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search the vault for a loadout")
    .addStringOption((opt) =>
      opt.setName("query")
        .setDescription("Loadout name, author, weapon class, or attachment")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const query = interaction.options.getString("query").toLowerCase();

    const { data, error } = await supabase
      .from("loadouts")
      .select("*")
      .order("likes", { ascending: false });

    if (error || !data?.length) {
      return interaction.editReply("❌ Could not reach the vault. Try again later.");
    }

    const results = data.filter((l) =>
      l.title.toLowerCase().includes(query) ||
      l.author.toLowerCase().includes(query) ||
      l.weapon_class.toLowerCase().includes(query) ||
      l.attachments.toLowerCase().includes(query) ||
      (l.description || "").toLowerCase().includes(query)
    );

    if (!results.length) {
      return interaction.editReply(`❌ No loadouts found matching **"${query}"**.`);
    }

    // Return top match with count
    const top = results[0];
    const embed = buildLoadoutEmbed(top);

    const suffix = results.length > 1
      ? `\n\n*${results.length - 1} more result${results.length > 2 ? "s" : ""} — search at ${process.env.SITE_URL}*`
      : "";

    await interaction.editReply({
      content: suffix || null,
      embeds: [embed],
    });
  },
};
