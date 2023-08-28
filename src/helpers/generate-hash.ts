import crypto from 'node:crypto';
export const generateHash = (
    id: string | number,
    title: string,
    dealType: string = 'general'
) => {
    return crypto
        .createHash('shake256', { outputLength: 15 })
        .update(`${id}-${title}-${dealType}`)
        .digest('hex');
};
