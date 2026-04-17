# Roblox Sales Bot — Setup Guide

A Discord bot that monitors your Roblox group sales in real time and lets
you query earnings by hour, day, week, or month.

---

## Features

- **Live sale alerts** posted to a Discord channel every 30 seconds
- Each alert shows: product name, buyer username, Robux amount, time, product icon, buyer avatar
- **`/stats`** command — earnings breakdown by hour / today / week / month / all time
- **`/recent`** command — last 10 sales at a glance
- Duplicate detection — same sale never posts twice
- Persistent storage in `data.json` (survives restarts)

---

## Requirements

- Node.js 18+
- A Discord bot token
- A Roblox account that is **Group Owner** or has **Treasurer** role (needs revenue access)

---

## Step 1 — Create a Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **New Application**, give it a name
3. Go to **Bot** tab → **Reset Token** → copy the token
4. Under **Privileged Gateway Intents**, nothing extra is needed
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Embed Links`, `Read Message History`
6. Open the generated URL and invite the bot to your server

---

## Step 2 — Get Your Roblox Cookie

> ⚠️ **Use a secondary Roblox account as the bot account, not your main.**
> The cookie is a sensitive credential — treat it like a password.

1. Log into Roblox in Chrome/Firefox with the account that has group revenue access
2. Open DevTools (F12) → **Application** tab → **Cookies** → `https://www.roblox.com`
3. Find `.ROBLOSECURITY` and copy its **Value**

---

## Step 3 — Get Your IDs

| Value | Where to find it |
|---|---|
| `DISCORD_CLIENT_ID` | Developer Portal → Your App → General Information → Application ID |
| `DISCORD_GUILD_ID` | Right-click your Discord server → Copy Server ID (enable Developer Mode in Discord settings) |
| `DISCORD_CHANNEL_ID` | Right-click the sales channel → Copy Channel ID |
| `ROBLOX_GROUP_ID` | Your Roblox group URL: `roblox.com/groups/XXXXXXX` |

---

## Step 4 — Install & Configure

```bash
# Clone or unzip the bot files, then:
cd roblox-sales-bot
npm install

# Copy the env template
cp .env.example .env

# Edit .env and fill in all 6 values
nano .env   # or open in VS Code
```

---

## Step 5 — Run the Bot

```bash
node index.js
```

You should see:
```
✅ Logged in as YourBot#1234
✅ Slash commands registered
🔄 Polling every 30s
```

---

## Keeping it Running 24/7

### Option A — PM2 (recommended, local/VPS)
```bash
npm install -g pm2
pm2 start index.js --name roblox-sales-bot
pm2 save
pm2 startup   # auto-start on reboot
```

### Option B — Railway / Render / Fly.io (free cloud hosting)
Upload the files and set environment variables in the dashboard.

---

## Commands

| Command | Description |
|---|---|
| `/stats hour` | Robux earned in the last 60 minutes |
| `/stats day` | Robux earned today (last 24h) |
| `/stats week` | Robux earned this week (last 7 days) |
| `/stats month` | Robux earned this month (last 30 days) |
| `/stats all` | All-time total tracked by the bot |
| `/recent` | Last 10 sales |

---

## Notes & Limitations

- Roblox's transaction API only returns the **last 100 transactions** per poll.
  If your group makes more than ~200 sales per minute, you may miss some.
  For most groups this is not an issue.
- The bot stores data in `data.json` locally. Back this up if you care about
  historical stats — deleting it resets your totals.
- The `.ROBLOSECURITY` cookie expires periodically. If the bot stops posting,
  refresh the cookie in `.env` and restart.
- Roblox does not provide an official webhook/push API for group sales,
  so polling is the only approach available.

