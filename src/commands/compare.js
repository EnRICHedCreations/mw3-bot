const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

async function getOperatorStats(username) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (!profile) return null;

  const { data: loadouts } = await supabase
    .from("loadouts")
    .select("*")
    .eq("user_id", profile.id);

  const totalLikes  = (loadouts || []).reduce((s, l) => s + (l.likes ?? 0), 0);
  const totalViews  = (loadouts || []).reduce((s, l) => s + (l.views ?? 0), 0);

  const classCounts = (loadouts || []).reduce((acc, l) => {
    acc[l.weapon_class] = (acc[l.weapon_class] || 0) + 1;
    return acc;
  }, {});
  const topClass = Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0];
  const topLoadout = [...(loadouts || [])].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))[0];

  return {
    profile,
    builds: (loadouts || []).length,
    totalLikes,
    totalViews,
    topClass: topClass ? topClass[0] : "—",
    topLoadout,
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("compare")
    .setDescription("Side by side stat comparison between two operators")
    .addStringOption((opt) =>
      opt.setName("operator1")
        .setDescription("First operator's username")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("operator2")
        .setDescription("Second operator's username")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const name1 = interaction.options.getString("operator1");
    const name2 = interaction.options.getString("operator2");

    const [op1, op2] = await Promise.all([
      getOperatorStats(name1),
      getOperatorStats(name2),
    ]);

    if (!op1) return interaction.editReply(`❌ Operator **"${name1}"** not found.`);
    if (!op2) return interaction.editReply(`❌ Operator **"${name2}"** not found.`);

    // Determine winners per category
    const likesWinner  = op1.totalLikes  >= op2.totalLikes  ? "⬅" : "➡";
    const viewsWinner  = op1.totalViews  >= op2.totalViews  ? "⬅" : "➡";
    const buildsWinner = op1.builds      >= op2.builds      ? "⬅" : "➡";

    const embed = new EmbedBuilder()
      .setColor(0xcc2020)
      .setTitle("⚔️  OPERATOR COMPARISON")
      .addFields(
        {
          name: "OPERATOR",
          value: `[${op1.profile.username}](${SITE_URL}/profile/${encodeURIComponent(op1.profile.username)})`,
          inline: true,
        },
        { name: "\u200b", value: "VS", inline: true },
        {
          name: "OPERATOR",
          value: `[${op2.profile.username}](${SITE_URL}/profile/${encodeURIComponent(op2.profile.username)})`,
          inline: true,
        },
        { name: "❤ LIKES",   value: `${op1.totalLikes}`,  inline: true },
        { name: likesWinner,  value: "LIKES",              inline: true },
        { name: "❤ LIKES",   value: `${op2.totalLikes}`,  inline: true },
        { name: "◉ VIEWS",   value: `${op1.totalViews}`,  inline: true },
        { name: viewsWinner,  value: "VIEWS",              inline: true },
        { name: "◉ VIEWS",   value: `${op2.totalViews}`,  inline: true },
        { name: "🔫 BUILDS",  value: `${op1.builds}`,     inline: true },
        { name: buildsWinner, value: "BUILDS",             inline: true },
        { name: "🔫 BUILDS",  value: `${op2.builds}`,     inline: true },
        { name: "◆ MAIN CLASS", value: op1.topClass,      inline: true },
        { name: "\u200b",    value: "\u200b",              inline: true },
        { name: "◆ MAIN CLASS", value: op2.topClass,      inline: true },
        {
          name: "▶ TOP BUILD",
          value: op1.topLoadout ? `[${op1.topLoadout.title}](${SITE_URL}/loadout/${op1.topLoadout.id}) ❤ ${op1.topLoadout.likes}` : "—",
          inline: true,
        },
        { name: "\u200b", value: "\u200b", inline: true },
        {
          name: "▶ TOP BUILD",
          value: op2.topLoadout ? `[${op2.topLoadout.title}](${SITE_URL}/loadout/${op2.topLoadout.id}) ❤ ${op2.topLoadout.likes}` : "—",
          inline: true,
        },
      )
      .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
