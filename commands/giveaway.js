
module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway!')
        .addStringOption(option => 
            option.setName('prize')
            .setDescription('Prize for the giveaway')
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
            .setDescription('Duration in seconds')
            .setRequired(true)),
    async execute(interaction) {
        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getInteger('duration');
        // Giveaway logic
        interaction.reply(`Giveaway started for: ${prize} for ${duration} seconds!`);
    },
};
