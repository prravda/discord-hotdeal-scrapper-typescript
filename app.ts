import { ppomppuHotDealPeriodically } from './src/schedulers/ppomppu-hot-deal-periodically';
import { fmKoreaHotDealPeriodically } from './src/schedulers/fmkorea-hot-deal-periodically';
import { BrokerPublisher } from './infra/broker/broker-publisher';

async function bootstrap() {
    // start broker - publisher
    await BrokerPublisher.start();

    // start scrapping job
    await ppomppuHotDealPeriodically();
    await fmKoreaHotDealPeriodically();
}

bootstrap();
