
const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('Song name or URL')
                .setRequired(true)),
    async execute(interaction) {
        const song = interaction.options.getString('song');
        // Connect to voice channel and play song logic
        interaction.reply(`Now playing: ${song}`);
    },
};
