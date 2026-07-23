const { SlashCommandBuilder } = require("discord.js");
const supabase = require("../supabase");
const { buildLoadoutEmbed } = require("../embeds");
const fetch = require("node-fetch");

const SITE_URL = process.env.SITE_URL || "https://mw3loadouts.com";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("post")
    .setDescription("Submit a loadout to the MW3 Loadout Vault")
    .addStringOption((opt) =>
      opt.setName("loadout_name")
        .setDescription("Name of your loadout")
        .setRequired(true)
        .setMaxLength(80)
    )
    .addStringOption((opt) =>
      opt.setName("weapon_class")
        .setDescription("Weapon class")
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
    )
    .addStringOption((opt) =>
      opt.setName("slot1")
        .setDescription("Attachment slot 1 — e.g. Muzzle: Shadowstrike Suppressor")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("slot2")
        .setDescription("Attachment slot 2 — e.g. Barrel: Bruen Venom Long Barrel")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("slot3")
        .setDescription("Attachment slot 3 — e.g. Underbarrel: VX Pineapple")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("slot4")
        .setDescription("Attachment slot 4 — e.g. Magazine: 45 Round Mag")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("slot5")
        .setDescription("Attachment slot 5 — e.g. Stock: Demo Fade Pro Stock")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("description")
        .setDescription("Optional description, playstyle notes, tips")
        .setRequired(false)
        .setMaxLength(300)
    )
    .addAttachmentOption((opt) =>
      opt.setName("screenshot")
        .setDescription("Screenshot of your loadout (optional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const loadoutName  = interaction.options.getString("loadout_name");
    const weaponClass  = interaction.options.getString("weapon_class");
    const description  = interaction.options.getString("description") || "";
    const screenshot   = interaction.options.getAttachment("screenshot");
    const discordUser  = interaction.user;

    // Collect attachment slots and filter out any empty ones
    const slots = [
      interaction.options.getString("slot1"),
      interaction.options.getString("slot2"),
      interaction.options.getString("slot3"),
      interaction.options.getString("slot4"),
      interaction.options.getString("slot5"),
    ].filter(Boolean);

    const attachments = slots.join("\n");

    // Require verified link
    const { data: link } = await supabase
      .from("discord_links")
      .select("username, user_id")
      .eq("discord_id", discordUser.id)
      .maybeSingle();

    if (!link) {
      return interaction.editReply(
        `❌ Your Discord isn't linked to a Loadout Vault account.\n\nRun \`/link <username>\` first so your loadouts are attributed to your profile.`
      );
    }

    const author = link.username;
    const userId = link.user_id;

    // Handle screenshot upload
    let image_url = null;
    if (screenshot) {
      if (!screenshot.contentType?.startsWith("image/")) {
        return interaction.editReply("❌ Screenshot must be an image file (PNG, JPG, WEBP).");
      }
      if (screenshot.size > 10 * 1024 * 1024) {
        return interaction.editReply("❌ Screenshot must be under 10MB.");
      }

      try {
        const imgResponse = await fetch(screenshot.url);
        const buffer = await imgResponse.buffer();
        const ext = screenshot.name.split(".").pop() || "png";
        const filename = `discord-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("loadout-screenshots")
          .upload(filename, buffer, { contentType: screenshot.contentType });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from("loadout-screenshots")
            .getPublicUrl(filename);
          image_url = publicData.publicUrl;
        }
      } catch (err) {
        console.error("Screenshot upload failed:", err);
      }
    }

    // Insert into Supabase
    const { data: loadout, error: insertError } = await supabase
      .from("loadouts")
      .insert({
        author,
        user_id: userId,
        title: loadoutName,
        weapon_class: weaponClass,
        attachments,
        description,
        image_url,
      })
      .select()
      .single();

    if (insertError || !loadout) {
      console.error("Insert error:", insertError);
      return interaction.editReply("❌ Failed to submit loadout. Try again or visit the site directly.");
    }

    const embed = buildLoadoutEmbed(loadout);

    await interaction.editReply({
      content: `✅ **Loadout submitted by ${author}!** View it on the vault:`,
      embeds: [embed],
    });
  },
};
