
module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        console.log(`${member.user.tag} has joined the server!`);
    },
};
