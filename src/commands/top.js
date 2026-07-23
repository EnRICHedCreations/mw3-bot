const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

const WEAPON_CLASS_COLORS = {
  Assault: 0xcc2020, SMG: 0xd4691e, Sniper: 0xc8a228, LMG: 0xb83232,
  Shotgun: 0x6a4faa, Marksman: 0x2a8a7a, Handgun: 0x5a7aaa, Launcher: 0xaa5a2a,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Show the top loadouts from the vault")
    .addStringOption((opt) =>
      opt.setName("sort")
        .setDescription("Sort by likes or views")
        .setRequired(false)
        .addChoices(
          { name: "Most Liked", value: "likes" },
          { name: "Most Viewed", value: "views" }
        )
    )
    .addStringOption((opt) =>
      opt.setName("class")
        .setDescription("Filter by weapon class")
        .setRequired(false)
        .addChoices(
          { name: "Assault",  value: "Assault" },
          { name: "SMG",      value: "SMG" },
          { name: "Sniper",   value: "Sniper" },
          { name: "LMG",      value: "LMG" },
          { name: "Shotgun",  value: "Shotgun" },
          { name: "Marksman", value: "Marksman" },
          { name: "Handgun",  value: "Handgun" },
          { name: "Launcher", value: "Launcher" }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const sortBy = interaction.options.getString("sort") || "likes";
    const weaponClass = interaction.options.getString("class");

    let query = supabase
      .from("loadouts")
      .select("*")
      .order(sortBy, { ascending: false })
      .limit(5);

    if (weaponClass) query = query.eq("weapon_class", weaponClass);

    const { data, error } = await query;

    if (error || !data?.length) {
      return interaction.editReply("❌ No loadouts found.");
    }

    const sortLabel = sortBy === "likes" ? "❤ MOST LIKED" : "◉ MOST VIEWED";
    const classLabel = weaponClass ? ` · ${weaponClass.toUpperCase()}` : "";

    const embed = new EmbedBuilder()
      .setColor(weaponClass ? (WEAPON_CLASS_COLORS[weaponClass] || 0xcc2020) : 0xcc2020)
      .setTitle(`◈  TOP LOADOUTS — ${sortLabel}${classLabel}`)
      .setURL(`${SITE_URL}/loadoutvault`)
      .setDescription(
        data.map((l, i) => {
          const stat = sortBy === "likes" ? `❤ ${l.likes ?? 0}` : `◉ ${l.views ?? 0}`;
          return `**${i + 1}.** [${l.title}](${SITE_URL}/loadout/${l.id}) — ${l.weapon_class} — ${stat} — by [${l.author}](${SITE_URL}/profile/${encodeURIComponent(l.author)})`;
        }).join("\n")
      )
      .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
