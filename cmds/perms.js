const { players } = (await import('../database.js')).default;
const whitelist = [
    "563879509275705345"
];

export default {
    name: "perms",
    desc: "Admin only. Set permissions integer for a player.",
    options: [
        {
            required: true,
            name: "username",
            type: 3,
            description: "Player username",
            min_length: 3,
            max_length: 12
        },
        {
            required: true,
            name: "perms",
            type: 4,
            description: "Permissions integer to set",
            min_value: 0
        }
    ],
    exec: async (interaction) => {
        if (!whitelist.includes(interaction.user.id)) {
            await interaction.reply({ content: "You're not authorized to use that!", ephemeral: true });
            return;
        }
        const username = interaction.options.getString("username") || "";
        const perms = interaction.options.getInteger("perms") || 0;
        let player = await players.findOne({ usernameLower: username.toLowerCase() });
        if (!player) {
            await interaction.reply({ content: "That player doesn't exist.", ephemeral: true });
            return;
        }
        let result = await players.updateOne({ username: player.username }, { $set: { perms: perms } });
        if (result.matchedCount) {
            await interaction.reply({ content: `Set ${player.username}'s permissions integer to ${perms}.`, ephemeral: true });
            return;
        }
    }
}