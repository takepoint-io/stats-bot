export default {
    name: "ping",
    desc: "A simple ping to test if it's online",
    exec: async (interaction) => {
        await interaction.reply("pong");
    }
}