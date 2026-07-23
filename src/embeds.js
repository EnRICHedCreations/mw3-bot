const { EmbedBuilder } = require("discord.js");

const WEAPON_CLASS_COLORS = {
  Assault:   0xcc2020,
  SMG:       0xd4691e,
  Sniper:    0xc8a228,
  LMG:       0xb83232,
  Shotgun:   0x6a4faa,
  Marksman:  0x2a8a7a,
  Handgun:   0x5a7aaa,
  Launcher:  0xaa5a2a,
};

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

function buildLoadoutEmbed(loadout) {
  const color = WEAPON_CLASS_COLORS[loadout.weapon_class] || 0xcc2020;

  // Parse attachments into fields
  const attachmentLines = loadout.attachments
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const attachmentText = attachmentLines
    .map((line) => {
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        const slot = line.slice(0, colonIdx).trim().toUpperCase();
        const value = line.slice(colonIdx + 1).trim();
        return `**${slot}:** ${value}`;
      }
      return line;
    })
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`◈  ${loadout.title.toUpperCase()}`)
    .setURL(`${SITE_URL}/loadout/${loadout.id}`)
    .addFields(
      { name: "◆ WEAPON CLASS", value: loadout.weapon_class, inline: true },
      { name: "◆ OPERATOR", value: `[${loadout.author}](${SITE_URL}/profile/${encodeURIComponent(loadout.author)})`, inline: true },
      { name: "◆ STATS", value: `❤ ${loadout.likes ?? 0} likes  ·  ◉ ${loadout.views ?? 0} views`, inline: true },
      { name: "▶ ATTACHMENTS", value: attachmentText || "No attachments listed." }
    )
    .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
    .setTimestamp(new Date(loadout.created_at));

  if (loadout.description) {
    embed.setDescription(`*${loadout.description}*`);
  }

  if (loadout.image_url) {
    embed.setImage(loadout.image_url);
  }

  return embed;
}

function buildProfileEmbed(profile, loadouts) {
  const totalLikes = loadouts.reduce((sum, l) => sum + (l.likes ?? 0), 0);
  const totalViews = loadouts.reduce((sum, l) => sum + (l.views ?? 0), 0);

  const classCounts = loadouts.reduce((acc, l) => {
    acc[l.weapon_class] = (acc[l.weapon_class] || 0) + 1;
    return acc;
  }, {});

  const topClass = Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0];
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const recentBuilds = loadouts.slice(0, 3)
    .map((l) => `• [${l.title}](${SITE_URL}/loadout/${l.id}) — ${l.weapon_class}`)
    .join("\n") || "No loadouts yet.";

  return new EmbedBuilder()
    .setColor(0xcc2020)
    .setTitle(`◆  ${profile.username.toUpperCase()}`)
    .setURL(`${SITE_URL}/profile/${encodeURIComponent(profile.username)}`)
    .addFields(
      { name: "LOADOUTS", value: `${loadouts.length}`, inline: true },
      { name: "TOTAL LIKES", value: `${totalLikes}`, inline: true },
      { name: "TOTAL VIEWS", value: `${totalViews}`, inline: true },
      { name: "MAIN CLASS", value: topClass ? `${topClass[0]} (${topClass[1]})` : "—", inline: true },
      { name: "MEMBER SINCE", value: memberSince, inline: true },
      { name: "▶ RECENT BUILDS", value: recentBuilds }
    )
    .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` });
}

function buildStatsEmbed(stats) {
  const { totalLoadouts, totalLikes, totalViews, topOperator, topLoadout, classCounts } = stats;

  const classBreakdown = Object.entries(classCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cls, count]) => `**${cls}:** ${count}`)
    .join("  ·  ");

  return new EmbedBuilder()
    .setColor(0xcc2020)
    .setTitle("◈  VAULT STATS")
    .setURL(SITE_URL)
    .addFields(
      { name: "TOTAL LOADOUTS", value: `${totalLoadouts}`, inline: true },
      { name: "TOTAL LIKES", value: `${totalLikes}`, inline: true },
      { name: "TOTAL VIEWS", value: `${totalViews}`, inline: true },
      { name: "TOP OPERATOR", value: topOperator ? `[${topOperator.author}](${SITE_URL}/profile/${encodeURIComponent(topOperator.author)}) — ${topOperator.count} builds` : "—", inline: true },
      { name: "MOST LIKED", value: topLoadout ? `[${topLoadout.title}](${SITE_URL}/loadout/${topLoadout.id}) — ❤ ${topLoadout.likes}` : "—", inline: true },
      { name: "▶ CLASS BREAKDOWN", value: classBreakdown || "—" }
    )
    .setFooter({ text: `MW3 LOADOUT VAULT  ·  ${SITE_URL}` })
    .setTimestamp();
}

module.exports = { buildLoadoutEmbed, buildProfileEmbed, buildStatsEmbed };
