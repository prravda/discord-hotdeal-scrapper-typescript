import { envList } from './infra/env-config';

import { Events, GatewayIntentBits } from 'discord.js';
const { Guilds, GuildMessages } = GatewayIntentBits;

import { Command, SlashCommand } from './types';

import { CommandHandler } from './infra/discord/command-handler';

import { TestDogCommand } from './src/commands/slash/test-dog';
import { HotDealPpomppuCommand } from './src/commands/slash/hot-deal-ppomppu-command';
import { HotDealFmKoreaCommand } from './src/commands/slash/hotdeal-fmkorea';
import { ClientInstance } from './infra/discord/client-instance';

async function bootstrap() {
    const slashCommandList: SlashCommand[] = [
        TestDogCommand,
        HotDealPpomppuCommand,
        HotDealFmKoreaCommand,
    ];

    const client = ClientInstance.getClient({
        intents: [Guilds, GuildMessages],
    });

    const commandHandler = new CommandHandler(slashCommandList);
    await commandHandler.enrollCommandsToDiscordInfra();

    const commandSet = commandHandler.getCommandCollection();

    client.once(Events.ClientReady, (c) => {
        try {
            console.log(`Ready! logged in as ${c.user.tag}`);
        } catch (e) {
            throw e;
        }
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = commandSet.get(interaction.commandName);

        if (!command) {
            throw new Error(
                `No command matching ${interaction.commandName} was found`
            );
        }

        try {
            await command.execute(interaction);
        } catch (e) {
            await interaction.reply({
                content: `An error is occurred!`,
            });
        }
    });

    await client.login(envList.DISCORD_TOKEN);
}

bootstrap();
