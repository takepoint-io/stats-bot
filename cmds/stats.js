const { players } = (await import('../database.js')).default;
const { ChartJSNodeCanvas } = await import('chartjs-node-canvas');
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

export default {
    name: "stats",
    desc: "Lookup player statistics",
    options: [
        {
            required: true,
            name: "username",
            type: 3,
            description: "The username of the player you want stats for",
            min_length: 3,
            max_length: 12
        }
    ],
    exec: async (interaction) => {
        const username = interaction.options.getString("username") || "";
        if (!validateUsername(username)) {
            await interaction.reply({ content: "Usernames have to be alphanumeric!", ephemeral: true });
            return;
        }
        let player = await players.findOne({ usernameLower: username.toLowerCase() });
        if (!player) {
            await interaction.reply({ content: "That player doesn't exist.", ephemeral: true });
            return;
        }
        let { pistol, assault, sniper, shotgun } = player.weapons;
        let statsColors = ["rgb(252, 244, 132)", "rgb(244, 132, 102)", "rgb(148, 236, 140)", "rgb(140, 220, 252)"];
        let weapons = [pistol, assault, sniper, shotgun].map((e, i) => [e, i]);
        let bestWeapon = weapons.sort((a, b) => b[0].kills - a[0].kills)[0];
        let primaryColor = statsColors[bestWeapon[1]];
        let rows = [
            `Total Score: **${player.score.toLocaleString()}**`,
            `Time Played: **${toTwoDecimals(msToHours(player.timePlayed))} hours**`,
            `Overall K/D Ratio: **${toTwoDecimals(player.kills / player.deaths)}**`,
            `Score Per Minute: **${toTwoDecimals(player.score / (msToHours(player.timePlayed) * 60))}**`,
            `Kills Per Minute: **${toTwoDecimals(player.kills / (msToHours(player.timePlayed) * 60))}**`,
            `Longest Killstreak: **${player.killstreak.toLocaleString()}**`,
            `Total Kills: **${player.kills.toLocaleString()}**`,
            `Total Deaths: **${player.deaths.toLocaleString()}**`,
            `Accuracy: **${player.accuracy.toLocaleString()}%**`,
            `Distance Covered: **${formatDistance(player.distanceCovered)}**`,
            `Double Kills: **${player.doubleKills.toLocaleString()}**`,
            `Triple Kills: **${player.tripleKills.toLocaleString()}**`,
            `Multi Kills: **${player.multiKills.toLocaleString()}**`,
            `Started Playing: **${timeAgo.format(player.createdAt)}**`,
            `Last Active: **${timeAgo.format(player.lastActive)}**`,
            `--`,
            `**Favorite Upgrades:**`,
            `Increase Speed: **${player.upgrades.speed.toLocaleString()}**`,
            `Faster Reload: **${player.upgrades.reload.toLocaleString()}**`,
            `Larger Mags: **${player.upgrades.mags.toLocaleString()}**`,
            `Extend View: **${player.upgrades.view.toLocaleString()}**`,
            `Heal Faster: **${player.upgrades.heal.toLocaleString()}**`,
            `--`,
            `**[View these stats online](${"https://stats.nitrogem35.pw/user/" + player.usernameLower})**`
        ]
        let chart = new ChartJSNodeCanvas({ width: 2000, height: 1000 });
        let config = {
            type: 'doughnut',
            data: {
                labels: [
                    `Pistol (${pistol.kills})`,
                    `Assault (${assault.kills})`,
                    `Sniper (${sniper.kills})`,
                    `Shotgun (${shotgun.kills})`
                ],
                datasets: [{
                    label: "Kills with weapon",
                    data: [pistol.kills, assault.kills, sniper.kills, shotgun.kills],
                    backgroundColor: statsColors
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: "white",
                            font: {
                                size: 65,
                            },
                            padding: 40,
                            boxWidth: 90
                        }
                    }
                },
            }
        }
        let rendered = await chart.renderToBuffer(config);
        let attachment = new AttachmentBuilder(rendered);
        attachment.name = "chart.png";
        let embed = new EmbedBuilder()
            .setColor(3066993)
            .setTitle(player.username + " Player Summary")
            .setImage('attachment://chart.png')
            .setDescription(rows.join("\n"))
            .setTimestamp()
            .setFooter({ text: "Requested by " + interaction.user.username, iconURL: interaction.user.avatarURL() });
        await interaction.reply({ embeds: [embed], files: [attachment] });
    }
}

const validateUsername = (username) => {
    let allowed = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let char of username) {
        if (!allowed.includes(char.toLowerCase())) return false;
    }
    return true;
}

const formatDistance = (distance) => {
    let m = distance / 100;
    let km = m / 1000;
    let miles = km / 1.60934;
    return `${toTwoDecimals(km)}km (${toTwoDecimals(miles)}mi)`;
}

const msToHours = (ms) => {
    return ms / (60 * 60 * 1000)
};

const toTwoDecimals = (n) => {
    return n.toLocaleString(undefined, {
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
    });
}