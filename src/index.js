const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const express = require('express');
require('dotenv').config();
const { scheduleJob } = require('node-schedule');
const { spawn } = require('child_process');

// Create Express app for keeping the bot alive
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Discord bot is running!');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Web server is running on port ${port}`);
});

// Schedule daily backups
const scheduleBackup = () => {
    scheduleJob('0 0 * * *', () => { // Run at midnight every day
        console.log('Starting scheduled backup...');
        const backup = spawn('python3', ['src/backup.py']);

        backup.stdout.on('data', (data) => {
            console.log(`Backup output: ${data}`);
        });

        backup.stderr.on('data', (data) => {
            console.error(`Backup error: ${data}`);
        });

        backup.on('close', (code) => {
            console.log(`Backup process exited with code ${code}`);
        });
    });
};


// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

// Create a collection for commands
client.commands = new Collection();

// Import commands
const hiCommand = require('./commands/hi');
client.commands.set(hiCommand.data.name, hiCommand);

// Register commands when the bot starts
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Function to register commands with exponential backoff
async function registerCommands(attempt = 1, maxAttempts = 5) {
    try {
        if (!process.env.CLIENT_ID) {
            throw new Error('CLIENT_ID is not set in environment variables');
        }

        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [hiCommand.data.toJSON()] },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(`Error refreshing commands (attempt ${attempt}):`, error);
        if (attempt < maxAttempts) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30 second delay
            console.log(`Retrying in ${delay/1000} seconds...`);
            setTimeout(() => registerCommands(attempt + 1, maxAttempts), delay);
        }
    }
}

// Handle command interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        try {
            const errorResponse = {
                content: 'There was an error executing this command!',
                ephemeral: true
            };

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply(errorResponse);
            } else {
                await interaction.followUp(errorResponse);
            }
        } catch (e) {
            console.error('Error sending error message:', e);
        }
    }
});

// When the client is ready, run this code
client.once('ready', () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    client.user.setActivity('/hi to say hello!', { type: 0 }); // 0 is for 'Playing'
    registerCommands(); // Register commands when bot is ready
    scheduleBackup(); //Schedule backup after bot is ready
});

// Add reconnection handling
client.on('disconnect', () => {
    console.log('Bot disconnected! Attempting to reconnect...');
});

client.on('error', error => {
    console.error('Discord client error:', error);
});

// Login to Discord with your client's token with reconnection logic
async function startBot(attempt = 1, maxAttempts = Infinity) {
    try {
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error(`Error logging in (attempt ${attempt}):`, error);
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30 second delay
        console.log(`Attempting to reconnect in ${delay/1000} seconds...`);
        setTimeout(() => startBot(attempt + 1), delay);
    }
}

// Handle process errors
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

// Start the bot
startBot();