const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const supabase = require("../supabase");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

const WEAPON_CLASS_COLORS = {
  Assault: 0xcc2020, SMG: 0xd4691e, Sniper: 0xc8a228, LMG: 0xb83232,
  Shotgun: 0x6a4faa, Marksman: 0x2a8a7a, Handgun: 0x5a7aaa, Launcher: 0xaa5a2a,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("class")
    .setDescription("Show the top 3 loadouts for a specific weapon class")
    .addStringOption((opt) =>
      opt.setName("name")
        .setDescription("Weapon class to look up")
        .setRequired(true)
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

    const weaponClass = interaction.options.getString("name");

    const { data, error } = await supabase
      .from("loadouts")
      .select("*")
      .eq("weapon_class", weaponClass)
      .order("likes", { ascending: false })
      .limit(3);

    if (error || !data?.length) {
      return interaction.editReply(`❌ No **${weaponClass}** loadouts found in the vault yet.`);
    }

    const color = WEAPON_CLASS_COLORS[weaponClass] || 0xcc2020;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`◈  TOP ${weaponClass.toUpperCase()} LOADOUTS`)
      .setURL(`${SITE_URL}/loadoutvault`)
      .setDescription(
        data.map((l, i) => {
          const attachmentLines = l.attachments
            .split("\n")
            .map((a) => a.trim())
            .filter(Boolean)
            .slice(0, 5);

          const attachText = attachmentLines.map((line) => {
            const colonIdx = line.indexOf(":");
            if (colonIdx !== -1) {
              const slot = line.slice(0, colonIdx).trim();
              const val = line.slice(colonIdx + 1).trim();
              return `• **${slot}:** ${val}`;
            }
            return `• ${line}`;
          }).join("\n");

          return [
            `**${i + 1}. [${l.title}](${SITE_URL}/loadout/${l.id})** — by [${l.author}](${SITE_URL}/profile/${encodeURIComponent(l.author)})`,
            `❤ ${l.likes ?? 0} likes  ·  ◉ ${l.views ?? 0} views`,
            attachText,
          ].join("\n");
        }).join("\n\n")
      )
      .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
