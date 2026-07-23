const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete one of your loadouts (requires /link)")
    .addStringOption((opt) =>
      opt.setName("loadout_name")
        .setDescription("Name of the loadout to delete (must match exactly)")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const loadoutName = interaction.options.getString("loadout_name");

    const { data: link } = await supabase
      .from("discord_links")
      .select("username, user_id")
      .eq("discord_id", interaction.user.id)
      .maybeSingle();

    if (!link) {
      return interaction.editReply("❌ You're not linked to a Loadout Vault account. Run `/link <username>` first.");
    }

    // Find matching loadout owned by this user
    const { data: loadout, error: findError } = await supabase
      .from("loadouts")
      .select("id, title, weapon_class")
      .eq("user_id", link.user_id)
      .ilike("title", loadoutName)
      .maybeSingle();

    if (findError || !loadout) {
      return interaction.editReply(`❌ No loadout found named **"${loadoutName}"** in your submissions.\n\nRun \`/mine\` to see your loadouts.`);
    }

    // Delete it
    const { error: deleteError } = await supabase
      .from("loadouts")
      .delete()
      .eq("id", loadout.id)
      .eq("user_id", link.user_id);

    if (deleteError) {
      return interaction.editReply("❌ Failed to delete the loadout. Try again or remove it on the site.");
    }

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(0xcc2020)
        .setTitle("✅ Loadout Deleted")
        .setDescription(`**${loadout.title}** (${loadout.weapon_class}) has been removed from the vault.`)
        .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
      ],
    });
  },
};
