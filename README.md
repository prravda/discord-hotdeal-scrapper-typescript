# discord-bot-typescript, boilerplate branch

---

# structure
```text
├── app.ts
├── infra
│   ├── env-config.ts
│   └── discord
│       └── command-handler.ts
├── package-lock.json
├── package.json
├── src
│   └── commands
│       ├── general
│       └── slash
├── tsconfig.json
└── types.d.ts

```
- `app.ts`: 전체적인 진입점입니다.
- `infra`: discord infrastructure handling 과 관련된 코드가 들어있습ㄴ니다.
- `commands`: discord bot 에서 사용할 command 를 정의합니다.
- `types.d.ts`: 개발을 하면서 추가로 사용해야 할 `discord.js` 의 submodule 들에 대한 type definition 이 들어가있습니다.
- `.env-example`: 환경변수를 정의하는 위치입니다.

# ingredients
- node.js: 18.14 (LTS version on 2023/02)
- typescript: 4.9.5
- discord.js: 14.7.1

# configuration
## fill the .env file
```dotenv
APP_ID=<YOUR_APP_ID>
PUBLIC_KEY=<YOUR_PUBLIC_KEY>

CLIENT_ID=<YOUR_CLIENT_ID>
CLIENT_SECRET=<YOUR_CLIENT_SECRET>

GUILD_ID=<YOUR_GUILD_ID>

DISCORD_TOKEN=<YOUR_DISCORD_TOKEN>

DISCORD_API_VERSION=<YOUR_DISCORD_API_VERSION>

PORT=<YOUR_PORT>
```
- 위의 항목들을 채워주시면 됩니다.

```typescript
import Joi from 'joi';

import dotenv from 'dotenv';
dotenv.config();

const envListSchema = Joi.object({
    APP_ID: Joi.string().required().description('discord bot application id'),
    PUBLIC_KEY: Joi.string().required().description('discord bot public key'),
    CLIENT_ID: Joi.string().required().description('discord bot client id'),
    CLIENT_SECRET: Joi.string()
        .required()
        .description('discord bot client secrete credential'),
    GUILD_ID: Joi.string()
        .required()
        .description("a guild's id to run this bot"),
    DISCORD_TOKEN: Joi.string()
        .required()
        .description('discord bot application token'),
    DISCORD_API_VERSION: Joi.string()
        .required()
        .description('discord API version number as string')
        .default('10'),
    PORT: Joi.number().required().default(3000),
}).unknown();

const validateEnvList = () => {
    const { error, value } = envListSchema.validate(process.env);

    if (error) {
        throw new Error(`Validation error: ${error.message}`);
    }

    return value;
};

const afterValidate = validateEnvList();

export const envList = {
    APP_ID: afterValidate.APP_ID as string,
    PUBLIC_KEY: afterValidate.PUBLIC_KEY as string,
    CLIENT_ID: afterValidate.CLIENT_ID as string,
    CLIENT_SECRET: afterValidate.CLIENT_SECRET as string,
    GUILD_ID: afterValidate.GUILD_ID as string,
    DISCORD_TOKEN: afterValidate.DISCORD_TOKEN as string,
    DISCORD_API_VERSION: afterValidate.DISCORD_API_VERSION as string,
    PORT: afterValidate.PORT as number,
};

```
- 이런 식으로 type-safe 하게 environment variable validation 을 진행합니다.

```shell
/Users/pravda/development/personal/discord-bot-typescript/infra/env-config.ts:30
        throw new Error(`Validation error: ${error.message}`);
              ^
Error: Validation error: "DISCORD_API_VERSION" is required
    at validateEnvList (/Users/pravda/development/personal/discord-bot-typescript/infra/env-config.ts:30:15)
    at Object.<anonymous> (/Users/pravda/development/personal/discord-bot-typescript/infra/env-config.ts:36:23)
    at Module._compile (node:internal/modules/cjs/loader:1226:14)
    at Module.m._compile (/Users/pravda/development/personal/discord-bot-typescript/node_modules/ts-node/src/index.ts:1618:23)
    at Module._extensions..js (node:internal/modules/cjs/loader:1280:10)
    at Object.require.extensions.<computed> [as .ts] (/Users/pravda/development/personal/discord-bot-typescript/node_modules/ts-node/src/index.ts:1621:12)
    at Module.load (node:internal/modules/cjs/loader:1089:32)
    at Function.Module._load (node:internal/modules/cjs/loader:930:12)
    at Module.require (node:internal/modules/cjs/loader:1113:19)
    at require (node:internal/modules/cjs/helpers:103:18)
[nodemon] app crashed - waiting for file changes before starting...


```
- 만약 위의 부분들을 모두 채우지 않는 경우 오류가 발생합니다.

---

# How it works?
```typescript
// app.ts
import { Client, Events, GatewayIntentBits } from 'discord.js';
const { Guilds, GuildMessages } = GatewayIntentBits;

import { Command, SlashCommand } from './types';

import { CommandHandler } from './infra/discord/command-handler';
import { TestDogCommand } from './src/commands/slash/test-dog';
import { envList } from './infra/config';

const slashCommandList: SlashCommand[] = [TestDogCommand];
const generalCommandList: Command[] = [];

const commandHandler = new CommandHandler(
    slashCommandList,
    generalCommandList,
    new Client({
        intents: [Guilds, GuildMessages],
    })
);

commandHandler.enrollCommandToDiscordInfra();
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

client.login(envList.DISCORD_TOKEN);
```
- entrypoint 인 `app.ts` 의 코드입니다. 
```typescript
const slashCommandList: SlashCommand[] = [TestDogCommand];
const generalCommandList: Command[] = [];
```
- 위처럼 내가 만든 command 를 `*CommandList` 라는 `*Command[]` type array 에 import 하여 넣어줍니다.
```typescript
const commandHandler = new CommandHandler(
    slashCommandList,
    generalCommandList,
    new Client({
        intents: [Guilds, GuildMessages],
    })
);
```
- 그리고 이런 식으로 `CommandHandler` class 의 instance 를 만들 때, 의존성을 주입해줍니다(dependency injection)
- Client 의 경우 `intents` 항목에 내가 처리할 요소들을 명시해주어야 합니다. 해당 항목은 discord developer portal 의 [해당 단락](https://discord.com/developers/docs/topics/gateway#sending-events) 을 참고하시면 더 많은 설명이 나와있습니다.
  - 현재 boilerplate 는 Guilds 와 관련된 GuildMessages 를 처리하는 식으로 구성하였기에 gateway intents bits 는 `Guilds` 와 `GuildsMessage` 를 명시했습니다.

```typescript
commandHandler.enrollCommandToDiscordInfra();
const client = commandHandler.enrollCommandsToLocalClient();
```
- 그리고 이런 식으로 주입한 의존성(command 들)을 통해 아래의 과정들을 진행합니다.
  - discord infra 에 내 command 를 등록
  - local client instance 의 commands, slashCommands 에 command 의 이름과 그 처리방식을 k-v 로 저장

```typescript
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
```
- discord infrastructure 에 명령어를 등록하는 과정은 다음과 같습니다.
  - token 을 통해 REST client instance 를 만든다.
  - `applicationGuildCommand` 를 등록하는 endpoint (discord.js 에선 `Routes` 로 잘 추상화가 되어있습니다) 로 내 command 들을 등록합니다.
  - 그 등록응답을 통해 내 명령어가 어떻게 등록되었는지 결과를 확인합니다.

```typescript
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
```
- local 에 존재하는 discord client 엔 commands 와 slashCommands 라는 `Collection<string, *Command>` 형태의 key-value storage 를 통해 등록한 명령어를 불러올 수 있도록 저장합니다.
- instance 생성 시 주입해주었던 `*Command[]` type 의 의존성들을 `forEach` 로 순회를 하며 client 에 등록한 뒤, 등록이 완료된 해당 client 를 결과값으로 반환합니다.

```typescript
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
```
- 이런 식으로 명령어 등록이 완료된 후엔, client 가 `InteractionCreate`라는 event 를 감지한 경우 event emitter 방식으로 해당 command 들과 그 처리방법을 자기가 가지고 있는 interaction handler 에서 찾아 처리합니다.

```typescript
import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../../types';

export const TestDogCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('테스트')
        .setDescription(`귀여운 강아지 사진을 출력합니다.`),
    execute: async (interaction) => {
        await interaction.reply('https://imgur.com/a/db2ZEyp');
    },
};
```
- 참고용으로 만든 명령어의 모습입니다.

```typescript
export interface SlashCommand {
    command: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => void;
    cooldown?: number;
}
```
- 이렇게 `types.d.ts` 에 interface 를 통한 Type definition 을 해 놓아서 해당 규격에 맞추어 잘 만들면 됩니다.
- 이런 식으로 규격화가 되어있는 만큼, event emitter 에서는 좀 더 추상화된 방식으로 간결하게 처리하는 것이 가능해집니다.

---

# Q&A
- 질문할 점이 있다면 pravda.kracota@gmail.com 으로 언제든지 연락주시면 감사하겠습니다.