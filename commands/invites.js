
module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Check your invite statistics'),
    async execute(interaction) {
        const user = interaction.user;
        // Fetch invite stats logic
        interaction.reply(`${user.tag} has invited 10 people!`);
    },
};
