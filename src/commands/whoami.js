const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");
const { buildProfileEmbed } = require("../embeds");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whoami")
    .setDescription("Check which Loadout Vault profile your Discord is linked to"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;

    const { data: link } = await supabase
      .from("discord_links")
      .select("username, user_id")
      .eq("discord_id", discordId)
      .maybeSingle();

    if (!link) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xc8a228)
          .setTitle("⚠️ Not Linked")
          .setDescription(`Your Discord isn't linked to a Loadout Vault profile yet.\n\nRun \`/link <username>\` to connect your account at **${SITE_URL}**.`)
        ],
      });
    }

    // Fetch their full profile + loadouts
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", link.user_id)
      .maybeSingle();

    const { data: loadouts } = await supabase
      .from("loadouts")
      .select("*")
      .eq("user_id", link.user_id)
      .order("created_at", { ascending: false });

    if (!profile) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xb83232)
          .setTitle("❌ Profile Not Found")
          .setDescription("Your link exists but the profile couldn't be found. Try `/unlink` and `/link` again.")
        ],
      });
    }

    const embed = buildProfileEmbed(profile, loadouts || []);
    embed.setTitle(`◆  ${profile.username.toUpperCase()}  ·  YOUR PROFILE`);

    await interaction.editReply({ embeds: [embed] });
  },
};
