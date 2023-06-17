import { PpomppuHotDealScrapper } from '../scrappers/ppomppu-hot-deal-scrapper';

export const ppomppuHotDealPeriodically = async () => {
    try {
        const ppomppuScrapper = new PpomppuHotDealScrapper();

        const job = async () => {
            const refreshedDealList =
                await ppomppuScrapper.getRefreshedHotDealList();

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
