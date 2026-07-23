const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";
const MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Top 5 operators ranked by total likes across all their builds"),

  async execute(interaction) {
    await interaction.deferReply();

    const { data, error } = await supabase
      .from("loadouts")
      .select("author, user_id, likes, views, title, id");

    if (error || !data?.length) {
      return interaction.editReply("❌ Could not fetch leaderboard data.");
    }

    // Aggregate by author
    const authorMap = data.reduce((acc, l) => {
      if (!acc[l.author]) {
        acc[l.author] = { author: l.author, likes: 0, views: 0, builds: 0 };
      }
      acc[l.author].likes  += l.likes ?? 0;
      acc[l.author].views  += l.views ?? 0;
      acc[l.author].builds += 1;
      return acc;
    }, {});

    const sorted = Object.values(authorMap)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);

    const board = sorted.map((op, i) =>
      `${MEDALS[i]} **[${op.author}](${SITE_URL}/profile/${encodeURIComponent(op.author)})** — ❤ ${op.likes} likes · ${op.builds} build${op.builds !== 1 ? "s" : ""} · ◉ ${op.views} views`
    ).join("\n");

    const embed = new EmbedBuilder()
      .setColor(0xcc2020)
      .setTitle("◈  OPERATOR LEADERBOARD")
      .setURL(`${SITE_URL}/loadoutvault`)
      .setDescription(board)
      .setFooter({ text: `MW3 LOADOUT VAULT  ·  Ranked by total likes  ·  ${SITE_URL}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
