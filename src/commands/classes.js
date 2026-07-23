const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

const CLASS_ICONS = {
  Assault: "🟢", SMG: "🟠", Sniper: "🟡", LMG: "🔴",
  Shotgun: "🟣", Marksman: "🔵", Handgun: "🩵", Launcher: "🟤",
};

const ALL_CLASSES = ["Assault", "SMG", "Sniper", "LMG", "Shotgun", "Marksman", "Handgun", "Launcher"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("classes")
    .setDescription("Show all weapon classes and how many builds exist for each"),

  async execute(interaction) {
    await interaction.deferReply();

    const { data, error } = await supabase
      .from("loadouts")
      .select("weapon_class, likes");

    if (error) {
      return interaction.editReply("❌ Could not fetch class data.");
    }

    const classCounts = (data || []).reduce((acc, l) => {
      if (!acc[l.weapon_class]) acc[l.weapon_class] = { count: 0, likes: 0 };
      acc[l.weapon_class].count++;
      acc[l.weapon_class].likes += l.likes ?? 0;
      return acc;
    }, {});

    const sorted = ALL_CLASSES
      .map((cls) => ({
        cls,
        count: classCounts[cls]?.count || 0,
        likes: classCounts[cls]?.likes || 0,
      }))
      .sort((a, b) => b.count - a.count);

    const maxCount = sorted[0]?.count || 1;

    const rows = sorted.map((c) => {
      const icon = CLASS_ICONS[c.cls] || "⚫";
      const barFilled = Math.round((c.count / maxCount) * 8);
      const bar = "█".repeat(barFilled) + "░".repeat(8 - barFilled);
      return `${icon} **${c.cls.padEnd(10)}** ${bar}  ${c.count} build${c.count !== 1 ? "s" : ""} · ❤ ${c.likes}`;
    }).join("\n");

    const embed = new EmbedBuilder()
      .setColor(0xcc2020)
      .setTitle("◈  WEAPON CLASS BREAKDOWN")
      .setURL(`${SITE_URL}/loadoutvault`)
      .setDescription(`\`\`\`\n${rows}\n\`\`\``)
      .addFields(
        { name: "TOTAL BUILDS", value: `${(data || []).length}`, inline: true },
        { name: "CLASSES WITH BUILDS", value: `${Object.keys(classCounts).length} / ${ALL_CLASSES.length}`, inline: true },
      )
      .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
