import { ppomppuHotDealPeriodically } from './src/schedulers/ppomppu-hot-deal-periodically';
import { fmKoreaHotDealPeriodically } from './src/schedulers/fmkorea-hot-deal-periodically';

async function bootstrap() {
    await ppomppuHotDealPeriodically();
    await fmKoreaHotDealPeriodically();
}

bootstrap();
