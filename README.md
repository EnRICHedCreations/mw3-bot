# MW3 Loadout Vault — Discord Bot

Slash command bot for the MW3 Loadout Vault site (mw3loadouts.com).

## Commands

| Command | Description |
|---|---|
| `/latest` | Shows the most recently submitted loadout |
| `/search <query>` | Search by loadout name, author, class, or attachment |
| `/top [sort] [class]` | Top 5 loadouts sorted by likes or views, optionally filtered by class |
| `/post` | Submit a loadout directly from Discord with screenshot |
| `/profile <username>` | View an operator's profile — stats, top class, recent builds |
| `/meta` | Most popular weapon classes submitted this week |
| `/stats` | Overall vault stats — totals, top operator, most liked loadout |

## Setup

### 1. Create a Discord Bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → name it "MW3 Loadout Vault"
3. Go to **Bot** → click **Add Bot**
4. Under **Privileged Gateway Intents** — no intents needed
5. Copy the **Token**
6. Go to **OAuth2 → General** and copy the **Client ID**

### 2. Invite the Bot to Your Server

Use this URL (replace CLIENT_ID):
```
https://discord.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot+applications.commands&permissions=2048
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in `.env`:
```
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SITE_URL=https://mw3loadouts.com
```

### 4. Install & Deploy

```bash
npm install

# Deploy slash commands to Discord (run once, or after adding new commands)
npm run deploy

# Start the bot
npm start

# Dev mode with auto-restart
npm run dev
```

### 5. Host on Railway (Free)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add all env vars under **Variables**
4. Set the start command to `npm start`

## Notes

- `/post` matches the Discord username to the Loadout Vault profile username automatically
- If no profile match is found, the Discord display name is used as the author
- Screenshots are uploaded directly to your Supabase storage bucket
- Global slash commands take up to 1 hour to appear after deploying — guild commands are instant if you add a GUILD_ID
