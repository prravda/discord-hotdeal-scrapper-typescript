import Joi from 'joi';

import dotenv from 'dotenv';
dotenv.config();

const envListSchema = Joi.object({}).unknown();

const validateEnvList = () => {
    const { error, value } = envListSchema.validate(process.env);

    if (error) {
        throw new Error(`Validation error: ${error.message}`);
    }

    return value;
};

const afterValidate = validateEnvList();

export const envList = {};
