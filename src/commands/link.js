const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your Discord account to your MW3 Loadout Vault profile")
    .addStringOption((opt) =>
      opt.setName("username")
        .setDescription("Your username on mw3loadouts.com")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const username = interaction.options.getString("username");
    const discordId = interaction.user.id;

    // Check profile exists on the site
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", username)
      .maybeSingle();

    if (profileError || !profile) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xb83232)
          .setTitle("❌ Profile Not Found")
          .setDescription(`No Loadout Vault account found with username **"${username}"**.\n\nMake sure you've created an account at **${SITE_URL}** first.`)
        ],
      });
    }

    // Check if this Discord ID is already linked
    const { data: existing } = await supabase
      .from("discord_links")
      .select("username")
      .eq("discord_id", discordId)
      .maybeSingle();

    if (existing) {
      if (existing.username.toLowerCase() === username.toLowerCase()) {
        return interaction.editReply({
          embeds: [new EmbedBuilder()
            .setColor(0xc8a228)
            .setTitle("⚠️ Already Linked")
            .setDescription(`Your Discord is already linked to **${existing.username}**.`)
          ],
        });
      }

      // Update existing link
      await supabase
        .from("discord_links")
        .update({ user_id: profile.id, username: profile.username })
        .eq("discord_id", discordId);

      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xcc2020)
          .setTitle("🔄 Link Updated")
          .setDescription(`Your Discord account has been re-linked from **${existing.username}** to **${profile.username}**.`)
          .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
        ],
      });
    }

    // Check if this Loadout Vault account is already claimed by another Discord user
    const { data: claimed } = await supabase
      .from("discord_links")
      .select("discord_id")
      .eq("user_id", profile.id)
      .maybeSingle();

    if (claimed && claimed.discord_id !== discordId) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xb83232)
          .setTitle("❌ Account Already Claimed")
          .setDescription(`The Loadout Vault account **${profile.username}** is already linked to another Discord user.\n\nIf this is yours, contact an admin.`)
        ],
      });
    }

    // Create the link
    const { error: insertError } = await supabase
      .from("discord_links")
      .insert({
        discord_id: discordId,
        user_id: profile.id,
        username: profile.username,
      });

    if (insertError) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xb83232)
          .setTitle("❌ Link Failed")
          .setDescription("Something went wrong. Try again or contact an admin.")
        ],
      });
    }

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(0xcc2020)
        .setTitle("✅ Account Linked")
        .addFields(
          { name: "◆ DISCORD", value: `${interaction.user.username}`, inline: true },
          { name: "◆ LOADOUT VAULT", value: `[${profile.username}](${SITE_URL}/profile/${encodeURIComponent(profile.username)})`, inline: true },
        )
        .setDescription("Your Discord is now linked. All loadouts you post with `/post` will be attributed to your profile.")
        .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
      ],
    });
  },
};
