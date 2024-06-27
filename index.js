import 'dotenv/config'
import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });
const commands = new Map();

for (let file of fs.readdirSync('cmds')) {
    let cmd = (await import('./cmds/' + file)).default;
    commands.set(cmd.name, cmd);
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}.`);

    const rest = new REST({ version: '10' }).setToken(process.env.token);
    try { 
        let cmdArray = Array.from(commands, ([name, cmd]) => ({ 
            name, 
            description: cmd.desc 
        }));
        await rest.put(Routes.applicationCommands(client.user.id), { body: cmdArray }); 
    } catch (e) {}
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (commands.has(interaction.commandName)) {
        await commands.get(interaction.commandName).exec(interaction);
    }
});

client.on('messageCreate', async message => {

});
  
client.login(process.env.token);