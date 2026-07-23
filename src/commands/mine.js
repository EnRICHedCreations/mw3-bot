const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

const WEAPON_CLASS_COLORS = {
  Assault: 0xcc2020, SMG: 0xd4691e, Sniper: 0xc8a228, LMG: 0xb83232,
  Shotgun: 0x6a4faa, Marksman: 0x2a8a7a, Handgun: 0x5a7aaa, Launcher: 0xaa5a2a,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mine")
    .setDescription("Show your submitted loadouts (requires /link)"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { data: link } = await supabase
      .from("discord_links")
      .select("username, user_id")
      .eq("discord_id", interaction.user.id)
      .maybeSingle();

    if (!link) {
      return interaction.editReply("❌ You're not linked to a Loadout Vault account. Run `/link <username>` first.");
    }

    const { data: loadouts, error } = await supabase
      .from("loadouts")
      .select("*")
      .eq("user_id", link.user_id)
      .order("created_at", { ascending: false });

    if (error || !loadouts?.length) {
      return interaction.editReply(`❌ You haven't submitted any loadouts yet. Use \`/post\` or visit ${SITE_URL}.`);
    }

    const totalLikes = loadouts.reduce((sum, l) => sum + (l.likes ?? 0), 0);
    const totalViews = loadouts.reduce((sum, l) => sum + (l.views ?? 0), 0);

    const loadoutList = loadouts.map((l, i) => {
      const color = WEAPON_CLASS_COLORS[l.weapon_class] ? `\`${l.weapon_class}\`` : `\`${l.weapon_class}\``;
      return `**${i + 1}.** [${l.title}](${SITE_URL}/loadout/${l.id}) — ${color} — ❤ ${l.likes ?? 0} · ◉ ${l.views ?? 0}`;
    }).join("\n");

    const embed = new EmbedBuilder()
      .setColor(0xcc2020)
      .setTitle(`◆  ${link.username.toUpperCase()}'S LOADOUTS`)
      .setURL(`${SITE_URL}/profile/${encodeURIComponent(link.username)}`)
      .setDescription(loadoutList)
      .addFields(
        { name: "TOTAL BUILDS", value: `${loadouts.length}`, inline: true },
        { name: "TOTAL LIKES", value: `${totalLikes}`, inline: true },
        { name: "TOTAL VIEWS", value: `${totalViews}`, inline: true },
      )
      .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
