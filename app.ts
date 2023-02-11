import * as dotenv from 'dotenv';
import { Client } from 'discord.js';
dotenv.config();

const client = new Client({
    intents: [],
});

client.login(process.env.DISCORD_TOKEN);
