import { verifyKey } from 'discord-interactions';

import * as dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

export class DiscordUtils {
    public verifyDiscordRequest(clientKey: string) {
        return function (req: any, res: any, buf: any, encoding: any) {
            const signature = req.get('X-Signature-Ed25519');
            const timestamp = req.get('X-Signature-Timestamp');

            const isValidRequest = verifyKey(
                buf,
                signature,
                timestamp,
                clientKey
            );
            if (!isValidRequest) {
                res.status(401).send('Bad request signature');
                throw new Error('Bad request signature');
            }
        };
    }

    private async discordRequest(endpoint: string, options: any) {
        const url = 'https://discord.com/api/v10/' + endpoint;
        // Stringify payloads
        if (options.body) options.body = JSON.stringify(options.body);
        // Use node-fetch to make requests
        const res = await fetch(url, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json; charset=UTF-8',
                'User-Agent':
                    'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
            },
            ...options,
        });
        // throw API errors
        if (!res.ok) {
            const data = await res.json();
            console.log(res.status);
            throw new Error(JSON.stringify(data));
        }
        // return original response
        return res;
    }

    private async installGuildCommand(
        appId: string,
        guildId: string,
        command: any
    ) {
        const endPoint = `applications/${appId}/guilds/${guildId}/commands`;
        try {
            await this.discordRequest(endPoint, {
                method: 'POST',
                body: command,
            });
        } catch (e) {
            console.error(e);
        }
    }

    private async hasGuildCommand(
        appId: string,
        guildId: string,
        command: any
    ) {
        const endPoint = `applications/${appId}/guilds/${guildId}/commands`;

        try {
            const res = await this.discordRequest(endPoint, { method: 'GET' });
            const data = await res.json();

            if (data) {
                const installedNames = data.map((c: any) => c['name']);
                if (!installedNames.includes(command['name'])) {
                    console.log(`Installing "${command['name']}"`);
                    await this.installGuildCommand(appId, guildId, command);
                } else {
                    console.log(
                        `"${command['name']}" command already installed`
                    );
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    public async hasGuildCommands(
        appId: string,
        guildId: string,
        commands: any
    ) {
        if (guildId === '' || appId === '') return;

        commands.forEach((c: any) => this.hasGuildCommand(appId, guildId, c));
    }
}
