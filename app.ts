import express from 'express';

import * as dotenv from 'dotenv';
dotenv.config();

import { DiscordUtils } from './infra/discord-utils';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { ECHO_COMMAND, TEST_COMMAND } from './src/commands';

const app = express();
const port = process.env.PORT;
const utils = new DiscordUtils();

app.use(
    express.json({
        verify: utils.verifyDiscordRequest(process.env.PUBLIC_KEY as string),
    })
);

app.post('/interactions', async (req, res) => {
    const { type, id, data } = req.body;

    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;

        if (name === 'test') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Hi, it's hgfarm bot!`,
                },
            });
        }

        if (name === 'echo') {
            const messageToEcho = req.body.data.options[0].value;

            console.log(messageToEcho);

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `It is what you said? ${messageToEcho}`,
                },
            });
        }
    }
});

app.listen(port, async () => {
    console.log(`Bot is started and listen port: ${port}`);

    await utils.hasGuildCommands(
        process.env.APP_ID as string,
        process.env.GUILD_ID as string,
        [TEST_COMMAND, ECHO_COMMAND]
    );
});
