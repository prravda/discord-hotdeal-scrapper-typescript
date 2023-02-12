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
