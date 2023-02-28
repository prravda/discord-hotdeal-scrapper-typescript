import { DiscordCommandEnrollResponse, SlashCommand } from '../../types';
import { Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { envList } from '../env-config';

export class CommandHandler {
    constructor(private readonly slashCommands: SlashCommand[]) {}

    public async enrollCommandsToDiscordInfra(): Promise<void> {
        const restClient = new REST({
            version: envList.DISCORD_API_VERSION,
        }).setToken(envList.DISCORD_TOKEN);

        try {
            const enrollResponse = (await restClient.put(
                Routes.applicationGuildCommands(
                    envList.CLIENT_ID,
                    envList.GUILD_ID
                ),
                {
                    body: this.slashCommands.map((c) => c.command.toJSON()),
                }
            )) as DiscordCommandEnrollResponse[];

            console.log(`Enrollment result: \n- total ${
                enrollResponse.length
            } commands are enrolled!: ${enrollResponse.map((c) => c.name)}
            `);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    public getCommandCollection() {
        try {
            const slashCommandCollection = new Collection<
                string,
                SlashCommand
            >();

            this.slashCommands.forEach((c) => {
                slashCommandCollection.set(c.command.name, c);
            });

            return slashCommandCollection;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}
