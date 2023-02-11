import * as dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
const { Guilds, MessageContent, GuildMessages, GuildMembers } =
    GatewayIntentBits;
dotenv.config();

const client = new Client({
    intents: [Guilds, MessageContent, GuildMessages, GuildMembers],
});

client.login(process.env.DISCORD_TOKEN);
