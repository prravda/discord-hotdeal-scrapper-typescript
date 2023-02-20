import { envList } from './infra/env-config';

import { Client, Events, GatewayIntentBits } from 'discord.js';
const { Guilds, GuildMessages } = GatewayIntentBits;

import { Command, SlashCommand } from './types';

import { CommandHandler } from './infra/discord/command-handler';

import { TestDogCommand } from './src/commands/slash/test-dog';
import { HotDealPpomppuCommand } from './src/commands/slash/hot-deal-ppomppu-command';
import { HotDealFmKoreaCommand } from './src/commands/slash/hotdeal-fmkorea';

async function bootstrap() {
    const slashCommandList: SlashCommand[] = [
        TestDogCommand,
        HotDealPpomppuCommand,
        HotDealFmKoreaCommand,
    ];
    const generalCommandList: Command[] = [];

    const commandHandler = new CommandHandler(
        slashCommandList,
        generalCommandList,
        new Client({
            intents: [Guilds, GuildMessages],
        })
    );

    await commandHandler.enrollCommandToDiscordInfra();
    const client = commandHandler.enrollCommandsToLocalClient();

    client.once(Events.ClientReady, (c) => {
        console.log(`Ready! logged in as ${c.user.tag}`);
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found`
            );
        }

        try {
            await command.execute(interaction);
        } catch (e) {
            console.error(e);
            await interaction.reply({
                content: `An error is occurred!`,
            });
        }
    });

    await client.login(envList.DISCORD_TOKEN);
}

bootstrap();
