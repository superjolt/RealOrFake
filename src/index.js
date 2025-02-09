const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

// Import commands
const hiCommand = require('./commands/hi');

// Command collection
const commands = [hiCommand.data.toJSON()];

// Register commands when the bot starts
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error refreshing commands:', error);
    }
})();

// Handle command interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    try {
        if (interaction.commandName === 'hi') {
            await hiCommand.execute(interaction);
        }
    } catch (error) {
        console.error('Error executing command:', error);
        try {
            await interaction.reply({
                content: 'There was an error executing this command!',
                ephemeral: true
            });
        } catch (e) {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error executing this command!',
                    ephemeral: true
                });
            }
        }
    }
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Bot is ready!');
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        console.error('Error logging in:', error);
        process.exit(1);
    });

// Handle process errors
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
