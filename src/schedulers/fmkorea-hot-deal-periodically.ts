import { FmkoreaHotDealScrapper } from '../scrappers/fmkorea-hot-deal-scrapper';

export const fmKoreaHotDealPeriodically = async () => {
    try {
        const fmKoreaScrapper = new FmkoreaHotDealScrapper();

        const job = async () => {
            const { popular, general } =
                await fmKoreaScrapper.getRefreshedHotDealList();

            // TODO: send this hot deal into broker's producer

            setTimeout(
                job,
                1000 * 60 * 26 + Math.floor(Math.random() * 100) * 1000
            );
        };

        await job();
    } catch (e) {
        throw e;
    }
};
