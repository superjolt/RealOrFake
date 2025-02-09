const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Command definition
    data: new SlashCommandBuilder()
        .setName('hi')
        .setDescription('Replies with a friendly greeting!'),

    // Command execution
    async execute(interaction) {
        try {
            await interaction.reply({
                content: `👋 Hi ${interaction.user.username}! Hope you're having a great day!`,
                ephemeral: false
            });
        } catch (error) {
            console.error('Error in hi command:', error);
            throw error; // Let the main error handler deal with it
        }
    },
};
