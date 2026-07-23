const { SlashCommandBuilder } = require("discord.js");
const supabase = require("../supabase");
const { buildProfileEmbed } = require("../embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Look up an operator's profile")
    .addStringOption((opt) =>
      opt.setName("username")
        .setDescription("The operator's username on MW3 Loadout Vault")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const username = interaction.options.getString("username");

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", username)
      .maybeSingle();

    if (profileError || !profile) {
      return interaction.editReply(`❌ No operator found with username **"${username}"**.`);
    }

    // Fetch their loadouts
    const { data: loadouts } = await supabase
      .from("loadouts")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    const embed = buildProfileEmbed(profile, loadouts || []);
    await interaction.editReply({ embeds: [embed] });
  },
};
