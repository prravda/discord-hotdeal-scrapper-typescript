import {
    Command,
    DiscordCommandEnrollResponse,
    SlashCommand,
} from '../../types';
import {
    Client,
    Collection,
    GatewayIntentBits,
    REST,
    Routes,
} from 'discord.js';
import { envList } from '../config';

export class CommandHandler {
    constructor(
        private readonly slashCommands: SlashCommand[],
        private readonly generalCommands: Command[],
        private readonly client: Client
    ) {}

    public enrollCommandsToLocalClient(): Client {
        this.client.commands = new Collection();
        this.client.slashCommands = new Collection<string, SlashCommand>();

        this.slashCommands.forEach((c) => {
            this.client.slashCommands.set(c.command.name, c);
        });

        this.generalCommands.forEach((c) => {
            this.client.commands.set(c.name, c);
        });

        return this.client;
    }

    public async enrollCommandToDiscordInfra(): Promise<void> {
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
        }
    }
}
