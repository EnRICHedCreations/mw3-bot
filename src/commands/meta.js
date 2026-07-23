const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

const CLASS_ICONS = {
  Assault: "🟢", SMG: "🟠", Sniper: "🟡", LMG: "🔴",
  Shotgun: "🟣", Marksman: "🔵", Handgun: "🩵", Launcher: "🟤",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meta")
    .setDescription("See the most popular weapon classes this week"),

  async execute(interaction) {
    await interaction.deferReply();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("loadouts")
      .select("weapon_class, likes, views")
      .gte("created_at", oneWeekAgo.toISOString());

    if (error || !data?.length) {
      return interaction.editReply("❌ Not enough data yet to show the meta.");
    }

    // Count submissions and total likes per class
    const classStats = data.reduce((acc, l) => {
      if (!acc[l.weapon_class]) acc[l.weapon_class] = { count: 0, likes: 0, views: 0 };
      acc[l.weapon_class].count++;
      acc[l.weapon_class].likes += l.likes ?? 0;
      acc[l.weapon_class].views += l.views ?? 0;
      return acc;
    }, {});

    const sorted = Object.entries(classStats).sort((a, b) => b[1].count - a[1].count);

    const breakdown = sorted.map(([cls, stats], i) => {
      const icon = CLASS_ICONS[cls] || "⚫";
      const bar = "█".repeat(stats.count) + "░".repeat(Math.max(0, 5 - stats.count));
      return `${i + 1}. ${icon} **${cls}** ${bar} — ${stats.count} build${stats.count !== 1 ? "s" : ""} · ❤ ${stats.likes}`;
    }).join("\n");

    const topClass = sorted[0];

    const embed = new EmbedBuilder()
      .setColor(0xcc2020)
      .setTitle("◈  THIS WEEK'S META")
      .setDescription(breakdown)
      .addFields(
        { name: "▶ DOMINANT CLASS", value: topClass ? `${CLASS_ICONS[topClass[0]] || ""} ${topClass[0]} (${topClass[1].count} submissions)` : "—", inline: true },
        { name: "▶ TOTAL BUILDS THIS WEEK", value: `${data.length}`, inline: true }
      )
      .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}  ·  Last 7 days` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
