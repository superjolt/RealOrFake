
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hi')
        .setDescription('Says hello with a random dog image!'),
    async execute(interaction) {
        try {
            // Get list of dog images
            const imagesDir = path.join(__dirname, '..', '..', 'attached_assets');
            const files = await fs.readdir(imagesDir);
            const dogImages = files.filter(file => 
                file.toLowerCase().includes('dog') && 
                (file.endsWith('.png') || file.endsWith('.jpg'))
            );

            if (dogImages.length === 0) {
                console.error('No dog images found in directory:', imagesDir);
                await interaction.reply('Hello! (Sorry, no dog images available at the moment)');
                return;
            }

            // Randomly select an image
            const randomImage = dogImages[Math.floor(Math.random() * dogImages.length)];
            const imagePath = path.join(imagesDir, randomImage);

            // Verify file exists and is readable
            try {
                await fs.access(imagePath);
                
                // First send the file, then create the embed
                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                
                const thankYouButton = new ButtonBuilder()
                    .setCustomId('thank_you')
                    .setLabel('Thank you!')
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder()
                    .addComponents(thankYouButton);

                await interaction.reply({
                    files: [{
                        attachment: imagePath,
                        name: randomImage
                    }],
                    embeds: [{
                        color: 0x0099FF,
                        title: 'Hello! 🐕',
                        description: 'Here\'s a friendly dog to brighten your day!',
                        image: {
                            url: `attachment://${randomImage}`
                        },
                        timestamp: new Date()
                    }],
                    components: [row],
                    fetchReply: true
                });

                // Create a collector for the button interaction
                const collector = interaction.channel.createMessageComponentCollector({ 
                    time: 60000 // Button will work for 1 minute
                });

                collector.on('collect', async i => {
                    if (i.customId === 'thank_you') {
                        await i.reply({ 
                            content: "You're welcome! 😊",
                            ephemeral: true
                        });
                    }
                });

                console.log(`Successfully sent image ${randomImage} from ${imagePath}`);
            } catch (error) {
                console.error(`Failed to access or send image ${randomImage}:`, error);
                await interaction.reply('Hello! (Sorry, I had trouble getting a dog image at the moment)');
            }
        } catch (error) {
            console.error('Error in hi command:', error);
            await interaction.reply('Sorry, something went wrong while getting the dog image!');
        }
    },
};
