import Joi from 'joi';
import 'dotenv/config';

const envListSchema = Joi.object({
    MEMPHIS_USER_HOT_DEAL_USER_NAME: Joi.string()
        .required()
        .description('hot deal producer id of memphis'),
    MEMPHIS_USER_HOT_DEAL_PASSWORD: Joi.string()
        .required()
        .description('hot deal producer password of memphis'),
    MEMPHIS_STATION_NAME: Joi.string()
        .required()
        .description('name of station'),
    MEMPHIS_PRODUCER_NAME: Joi.string()
        .required()
        .description('name of producer'),
    HOT_DEAL_UPDATED_EVENT_VERSION: Joi.number()
        .required()
        .description('version of hot deal updated event'),
}).unknown();

const validateEnvList = () => {
    const { error, value } = envListSchema.validate(process.env);

    if (error) {
        throw new Error(`Validation error: ${error.message}`);
    }

    return value;
};

const afterValidate = validateEnvList();

export const ENV_LIST = {
    MEMPHIS_USER_HOT_DEAL_USER_NAME:
        afterValidate.MEMPHIS_USER_HOT_DEAL_USER_NAME as string,
    MEMPHIS_USER_HOT_DEAL_PASSWORD:
        afterValidate.MEMPHIS_USER_HOT_DEAL_PASSWORD as string,
    MEMPHIS_STATION_NAME: afterValidate.MEMPHIS_STATION_NAME as string,
    MEMPHIS_PRODUCER_NAME: afterValidate.MEMPHIS_PRODUCER_NAME as string,
    HOT_DEAL_UPDATED_EVENT_VERSION:
        afterValidate.HOT_DEAL_UPDATED_EVENT_VERSION as number,
};
