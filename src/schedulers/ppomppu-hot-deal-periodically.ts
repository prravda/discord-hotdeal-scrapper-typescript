import { PpomppuHotDealScrapper } from '../scrappers/ppomppu-hot-deal-scrapper';
import { ClientInstance } from '../../infra/discord/client-instance';
import { APIEmbedField, EmbedBuilder } from 'discord.js';

export const ppomppuHotDealPeriodically = async () => {
    try {
        const client = ClientInstance.getClient();
        const ppomppuScrapper = new PpomppuHotDealScrapper();

        const job = async () => {
            const refreshedDealList =
                await ppomppuScrapper.getRefreshedHotDealList();

            // TODO: send this hot deal into broker's producer

            setTimeout(
                job,
                1000 * 60 * 5 + Math.floor(Math.random() * 100) * 1000
            );
        };

        await job();
    } catch (e) {
        throw e;
    }
};
