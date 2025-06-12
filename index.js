// index.js - Bot Discord complet avec musique, giveaways, stats d'invites, et notifications Twitch/TikTok
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const mongoose = require('mongoose');

// Initialisation du bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();
const prefix = process.env.PREFIX || '!';

// === Connexion MongoDB ===
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('MongoDB erreur :', err));

// === Modèle Utilisateur (TikTok/Twitch) ===
const User = mongoose.model('User', new mongoose.Schema({
  userId: String,
  twitch: String,
  tiktok: String,
  invites: Number
}));

// === Commandes simples ===
client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.reply('🏓 Pong!');
  }

  if (command === 'set') {
    const [plateforme, identifiant] = args;
    if (!['twitch', 'tiktok'].includes(plateforme)) return message.reply('Utilisation: !set twitch|tiktok identifiant');
    const data = await User.findOneAndUpdate(
      { userId: message.author.id },
      { [plateforme]: identifiant },
      { upsert: true, new: true }
    );
    message.reply(`✅ Ton ${plateforme} a été enregistré: ${identifiant}`);
  }

  if (command === 'info') {
    const data = await User.findOne({ userId: message.author.id });
   if (!data) return message.reply("Tu n'as enregistré aucun compte.");
   message.reply(`📺 Twitch: ${data.twitch || 'Aucun'}\n🎵 TikTok: ${data.tiktok || 'Aucun'}`);
  }

  if (command === 'invite') {
    const member = await message.guild.members.fetch(message.author.id);
    const invites = await message.guild.invites.fetch();
    const userInvites = invites.filter(inv => inv.inviter && inv.inviter.id === member.id);
    const totalInvites = userInvites.reduce((acc, inv) => acc + inv.uses, 0);
    message.reply(`🔗 Tu as invité ${totalInvites} membres !`);
  }

  if (command === 'play') {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Tu dois être en vocal !');
    const song = args.join(' ');
    if (!song) return message.reply('Tu dois fournir un nom de chanson ou un lien.');
    distube.play(voiceChannel, song, { textChannel: message.channel, member: message.member });
  }

  if (command === 'stop') {
    distube.stop(message);
    message.reply('🛑 Musique arrêtée.');
  }

  if (command === 'skip') {
    distube.skip(message);
    message.reply('⏭️ Musique suivante.');
  }

  if (command === 'giveaway') {
    const duration = parseInt(args[0]) || 10;
    const prize = args.slice(1).join(' ') || 'Cadeau mystère';
    const msg = await message.channel.send(`🎉 Giveaway pour **${prize}** ! Cliquez sur 🎉 pour participer ! (fin dans ${duration}s)`);
    await msg.react('🎉');
    setTimeout(async () => {
      const reaction = await msg.reactions.cache.get('🎉').users.fetch();
      const participants = reaction.filter(u => !u.bot).map(u => u);
      const winner = participants[Math.floor(Math.random() * participants.length)];
      if (winner) message.channel.send(`🎉 Bravo ${winner}, tu gagnes **${prize}** !`);
     else message.channel.send('😢 Personne n\'a participé.');
    }, duration * 1000);
  }
});

// === DisTube (Musique) ===
const distube = new DisTube(client, {
  emitNewSongOnly: true,
  plugins: [new SpotifyPlugin()]
});

distube
  .on('playSong', (queue, song) => queue.textChannel.send(`🎶 Lecture: \`${song.name}\``))
  .on('addSong', (queue, song) => queue.textChannel.send(`➕ Ajouté: \`${song.name}\``));

// === Prêt ===
client.once('ready', () => {
  console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
