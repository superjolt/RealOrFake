let list = ["link1", "link2", "link3"]

console.log(list[Math.floor(Math.random() * (list.length - 1))])

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Sends a random image from a list of images.'),
    async execute(interaction) {
        try {
            // Randomly select an image
            const randomImage = list[Math.floor(Math.random() * (list.length - 1))]

            // Create embed with the image
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Hello!')
                .setDescription('Here\'s an image:\n' + randomImage)
                .setTimestamp();

            // Send the response with the attached image
            await interaction.reply({
                embeds: [embed],
            });

            console.log('Successfully sent image:', randomImage); // Add logging
        }
        catch (error) {
            console.error('Error executing the command:', error);
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    },
};
