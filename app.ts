import { envList } from './infra/env-config';

import { Events, GatewayIntentBits } from 'discord.js';
const { Guilds, GuildMessages } = GatewayIntentBits;

import { SlashCommand } from './types';

import { CommandHandler } from './infra/discord/command-handler';

import { TestDogCommand } from './src/commands/slash/test-dog';
import { ClientInstance } from './infra/discord/client-instance';
import { ppomppuHotDealPeriodically } from './src/schedulers/ppomppu-hot-deal-periodically';
import { fmKoreaHotDealPeriodically } from './src/schedulers/fmkorea-hot-deal-periodically';

async function bootstrap() {
    const slashCommandList: SlashCommand[] = [TestDogCommand];

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

    const loginResult = await client.login(envList.DISCORD_TOKEN);

    if (loginResult) {
        await ppomppuHotDealPeriodically();
        await fmKoreaHotDealPeriodically();
    }
}

bootstrap();
