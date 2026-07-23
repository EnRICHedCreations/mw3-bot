const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlink")
    .setDescription("Unlink your Discord account from your MW3 Loadout Vault profile"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;

    const { data: existing } = await supabase
      .from("discord_links")
      .select("username")
      .eq("discord_id", discordId)
      .maybeSingle();

    if (!existing) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xc8a228)
          .setTitle("⚠️ Not Linked")
          .setDescription("Your Discord account isn't linked to any Loadout Vault profile.")
        ],
      });
    }

    await supabase
      .from("discord_links")
      .delete()
      .eq("discord_id", discordId);

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(0xcc2020)
        .setTitle("✅ Account Unlinked")
        .setDescription(`Your Discord has been unlinked from **${existing.username}**.\n\nLoadouts posted with \`/post\` will now use your Discord display name as the author.`)
        .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
      ],
    });
  },
};
