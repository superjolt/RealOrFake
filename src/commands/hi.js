const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hi')
        .setDescription('Responds with a friendly greeting!')
        .setDefaultMemberPermissions(null), // This makes the command available to everyone
    async execute(interaction) {
        try {
            await interaction.reply({
                content: `👋 Hi ${interaction.user.username}! Nice to meet you!`,
                ephemeral: false
            });
        } catch (error) {
            console.error('Error executing hi command:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error executing this command!',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'There was an error executing this command!',
                    ephemeral: true
                });
            }
        }
    },
};