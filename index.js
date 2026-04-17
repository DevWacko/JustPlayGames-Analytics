const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ─── CONFIG ────────────────────────────────────────────────────────────────
const CONFIG = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,       // Your server ID
  DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,   // Channel to post sales
  DISCORD_USER_ID: '467808731510472725',                 // Your Discord user ID for pings
  ROBLOX_COOKIE: process.env.ROBLOX_COOKIE,             // .ROBLOSECURITY cookie
  ROBLOX_GROUP_ID: process.env.ROBLOX_GROUP_ID,
  POLL_INTERVAL_MS: 10_000,                              // 10 seconds
};

// ─── PERSISTENCE ───────────────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { seenTransactionIds: [], sales: [] };
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { seenTransactionIds: [], sales: [] }; }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let db = loadData();

// ─── ROBLOX API ────────────────────────────────────────────────────────────
const robloxHeaders = () => ({
  'Cookie': `.ROBLOSECURITY=${CONFIG.ROBLOX_COOKIE}`,
  'Content-Type': 'application/json',
});

async function getGroupSales(cursor = null) {
  const url = `https://economy.roblox.com/v2/groups/${CONFIG.ROBLOX_GROUP_ID}/transactions?transactionType=Sale&limit=100${cursor ? `&cursor=${cursor}` : ''}`;
  const res = await axios.get(url, { headers: robloxHeaders() });
  return res.data;
}

async function getProductThumbnail(assetId, productType = 'Asset') {
  try {
    // For gamepasses, try to get the icon from the gamepass API
    if (productType === 'GamePass') {
      try {
        const res = await axios.get(`https://games.roblox.com/v1/games/passes?gamePassIds=${assetId}`);
        return res.data?.data?.[0]?.iconImageUrl || null;
      } catch { }
    }
    
    // Fallback to asset thumbnail
    const res = await axios.get(
      `https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=150x150&format=Png&isCircular=false`
    );
    return res.data?.data?.[0]?.imageUrl || null;
  } catch { return null; }
}

async function getUserAvatar(userId) {
  try {
    const res = await axios.get(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`
    );
    return res.data?.data?.[0]?.imageUrl || null;
  } catch { return null; }
}

// ─── DISCORD CLIENT ────────────────────────────────────────────────────────
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ─── SLASH COMMANDS ────────────────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View your Roblox group sales earnings')
    .addStringOption(opt =>
      opt.setName('period')
        .setDescription('Time period to calculate')
        .setRequired(true)
        .addChoices(
          { name: '⏰ Last Hour', value: 'hour' },
          { name: '📅 Today', value: 'day' },
          { name: '📆 Yesterday', value: 'yesterday' },
        )
    ),
  new SlashCommandBuilder()
    .setName('weekly')
    .setDescription('View daily earnings for the past 7 days'),
  new SlashCommandBuilder()
    .setName('recent')
    .setDescription('Show the last 10 sales'),
  new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test the sale notification embed'),
].map(cmd => cmd.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(CONFIG.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(CONFIG.DISCORD_CLIENT_ID, CONFIG.DISCORD_GUILD_ID),
    { body: commands }
  );
  console.log('✅ Slash commands registered');
}

// ─── STATS HELPER ─────────────────────────────────────────────────────────
function calcStats(period) {
  const now = Date.now();
  const cutoffs = {
    hour:  now - 1000 * 60 * 60,
    day:   now - 1000 * 60 * 60 * 24,
    yesterday: now - 1000 * 60 * 60 * 24 * 2, // From 2 days ago to 1 day ago
    week:  now - 1000 * 60 * 60 * 24 * 7,
    month: now - 1000 * 60 * 60 * 24 * 30,
    all:   0,
  };
  const cutoff = cutoffs[period] ?? 0;
  let filtered;
  if (period === 'yesterday') {
    const yesterdayStart = new Date();
    yesterdayStart.setHours(0, 0, 0, 0);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);
    filtered = db.sales.filter(s => s.timestamp >= yesterdayStart.getTime() && s.timestamp <= yesterdayEnd.getTime());
  } else {
    filtered = db.sales.filter(s => s.timestamp >= cutoff);
  }
  const totalRobux = filtered.reduce((sum, s) => sum + s.robux, 0);
  return { count: filtered.length, totalRobux };
}

function periodLabel(period) {
  switch (period) {
    case 'hour': return 'Last Hour';
    case 'day': return 'Today';
    case 'yesterday': return 'Yesterday';
    default: return 'Unknown';
  }
}

function getWeeklyStats() {
  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    const daySales = db.sales.filter(s => s.timestamp >= date.getTime() && s.timestamp <= endDate.getTime());
    const total = daySales.reduce((sum, s) => sum + s.robux, 0);
    days.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      total
    });
  }
  return days;
}

// ─── SALE EMBED ────────────────────────────────────────────────────────────
async function buildSaleEmbed(transaction) {
  const { agent, details, currency } = transaction;
  const buyerName  = agent?.name  || 'Unknown';
  const buyerId    = agent?.id    || null;
  const productName = details?.name || 'Unknown Product';
  const productType = details?.type || 'Asset';
  const assetId    = details?.id   || null;
  const robux      = currency?.amount || 0;

  const [thumbnail, avatar] = await Promise.all([
    assetId ? getProductThumbnail(assetId, productType) : Promise.resolve(null),
    buyerId ? getUserAvatar(buyerId) : Promise.resolve(null),
  ]);

  const embed = new EmbedBuilder()
    .setColor(0x5865F2) // Modern Discord blue
    .setTitle('💎 **New Sale Alert!** 💎')
    .setDescription(`🎯 **${productName}**\n💰 **R$ ${robux.toLocaleString()}**`)
    .addFields(
      { name: '👤 **Buyer**', value: buyerId ? `[${buyerName}](https://www.roblox.com/users/${buyerId}/profile)` : buyerName, inline: true },
      { name: '⏰ **Time**', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
      { name: '🏷️ **Type**', value: productType === 'GamePass' ? '🎫 Game Pass' : productType === 'DeveloperProduct' ? '🛠️ Developer Product' : '📦 Asset', inline: true },
    )
    .setFooter({ text: `Roblox Group Sales • ID: ${CONFIG.ROBLOX_GROUP_ID}`, iconURL: 'https://i.imgur.com/4M7IWwP.png' }) // Roblox logo
    .setTimestamp();

  if (thumbnail) embed.setThumbnail(thumbnail);
  if (avatar) embed.setAuthor({ name: `${buyerName} purchased`, iconURL: avatar });

  return embed;
}

// ─── POLLING LOOP ──────────────────────────────────────────────────────────
async function pollSales() {
  try {
    const data = await getGroupSales();
    const transactions = data?.data || [];
    const channel = await client.channels.fetch(CONFIG.DISCORD_CHANNEL_ID);

    let newSales = 0;
    for (const tx of transactions.reverse()) {
      const id = tx.purchaseToken || String(tx.id);
      if (db.seenTransactionIds.includes(id)) continue;

      newSales++;
      console.log(`[NEW SALE] Transaction: ${id} - ${tx.details?.name}`);
      // Mark as seen
      db.seenTransactionIds.push(id);
      if (db.seenTransactionIds.length > 5000) db.seenTransactionIds.shift();

      // Record the sale
      const robux = tx.currency?.amount || 0;
      db.sales.push({ id, timestamp: Date.now(), robux, name: tx.details?.name || 'Unknown' });
      if (db.sales.length > 10000) db.sales.shift();
      saveData(db);

      // Post to Discord
      try {
        const embed = await buildSaleEmbed(tx);
        const productName = tx.details?.name || 'Unknown Product';
        const robux = tx.currency?.amount || 0;
        const mention = CONFIG.DISCORD_USER_ID ? `<@${CONFIG.DISCORD_USER_ID}>` : '';
        const saleDetails = `${productName} - R$ ${robux.toLocaleString()}`;
        await channel.send({
          content: `**${saleDetails}** ${mention}`,
          embeds: [embed],
          allowedMentions: { users: CONFIG.DISCORD_USER_ID ? [CONFIG.DISCORD_USER_ID] : [] },
        });
      } catch (sendErr) {
        console.error('Failed to send message:', sendErr.message);
      }
    }
    if (newSales > 0) console.log(`Posted ${newSales} new sales`);
  } catch (err) {
    console.error('Poll error:', err.response?.data || err.message);
  }
}

// ─── INTERACTION HANDLER ───────────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === 'stats') {
      const period = interaction.options.getString('period');
      const { count, totalRobux } = calcStats(period);

      const embed = new EmbedBuilder()
        .setColor(0x57F287) // Green
        .setTitle(`📊 **Sales Statistics** 📊`)
        .setDescription(`📅 **${periodLabel(period)}**`)
        .addFields(
          { name: '🧾 **Transactions**', value: `**${count.toLocaleString()}**`, inline: true },
          { name: '💰 **Total Earned**', value: `**R$ ${totalRobux.toLocaleString()}**`, inline: true },
          { name: '📈 **Average per Sale**', value: count > 0 ? `**R$ ${Math.round(totalRobux / count).toLocaleString()}**` : '**N/A**', inline: true },
        )
        .setFooter({ text: `Roblox Group Sales • ID: ${CONFIG.ROBLOX_GROUP_ID}`, iconURL: 'https://i.imgur.com/4M7IWwP.png' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'recent') {
    const recent = [...db.sales].reverse().slice(0, 10);
    if (!recent.length) {
      await interaction.reply({ content: 'No sales recorded yet.', ephemeral: true });
      return;
    }

    const lines = recent.map((s, i) =>
      `**${i + 1}.** ${s.name} — R$ ${s.robux.toLocaleString()} — <t:${Math.floor(s.timestamp / 1000)}:R>`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0xFEE75C) // Yellow
      .setTitle('🕒 **Recent Sales** 🕒')
      .setDescription(lines)
      .setFooter({ text: `Roblox Group Sales • ID: ${CONFIG.ROBLOX_GROUP_ID}`, iconURL: 'https://i.imgur.com/4M7IWwP.png' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'weekly') {
    const days = getWeeklyStats();
    const maxRobux = Math.max(...days.map(d => d.total));
    const barLength = 20;

    const chart = days.map(day => {
      const bar = '█'.repeat(Math.round((day.total / maxRobux) * barLength) || 1);
      return `${day.date}: ${bar} R$ ${day.total.toLocaleString()}`;
    }).join('\n');

    const totalWeekly = days.reduce((sum, d) => sum + d.total, 0);

    const embed = new EmbedBuilder()
      .setColor(0xEB459E) // Pink
      .setTitle('📊 **Weekly Earnings Chart** 📊')
      .setDescription(`\`\`\`\n${chart}\n\`\`\``)
      .addFields(
        { name: '💰 **Total This Week**', value: `**R$ ${totalWeekly.toLocaleString()}**`, inline: true },
        { name: '📈 **Daily Average**', value: `**R$ ${Math.round(totalWeekly / 7).toLocaleString()}**`, inline: true },
      )
      .setFooter({ text: `Roblox Group Sales • ID: ${CONFIG.ROBLOX_GROUP_ID}`, iconURL: 'https://i.imgur.com/4M7IWwP.png' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'test') {
    // Sample transaction for testing
    const sampleTransaction = {
      agent: { name: 'TestBuyer', id: 123456789 },
      details: { name: 'Test Product', type: 'GamePass', id: 12345 },
      currency: { amount: 100 }
    };
    const embed = await buildSaleEmbed(sampleTransaction);
    const mention = CONFIG.DISCORD_USER_ID ? `<@${CONFIG.DISCORD_USER_ID}>` : '';
    const productName = sampleTransaction.details.name;
    const robux = sampleTransaction.currency.amount;
    const saleDetails = `${productName} - R$ ${robux.toLocaleString()}`;
    await interaction.reply({ content: `**${saleDetails}** ${mention}`, embeds: [embed] });
  }
  } catch (err) {
    console.error('Interaction error:', err);
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({ content: 'There was an error handling that command. Please try again.', ephemeral: true });
      } catch (replyErr) {
        console.error('Failed to send error response:', replyErr);
      }
    }
  }
});

// ─── BOOT ─────────────────────────────────────────────────────────────────
client.once('clientReady', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  await registerCommands();

  // Initial poll then interval
  await pollSales();
  setInterval(pollSales, CONFIG.POLL_INTERVAL_MS);
  console.log(`🔄 Polling every ${CONFIG.POLL_INTERVAL_MS / 1000}s`);
});

client.login(CONFIG.DISCORD_TOKEN);
