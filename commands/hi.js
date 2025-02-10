const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hi')
        .setDescription('Says hello!'),
    async execute(interaction) {
        try {
            await interaction.reply('Hello!');
        } catch (error) {
            console.error('Error executing hi command:', error);
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    },
};