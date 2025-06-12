
module.exports = {
    data: new SlashCommandBuilder()
        .setName('reward')
        .setDescription('Give a reward for invites')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to reward')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        // Reward logic based on invites
        interaction.reply(`Reward granted to ${user.tag}!`);
    },
};
