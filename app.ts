import { ppomppuHotDealPeriodically } from './src/schedulers/ppomppu-hot-deal-periodically';
import { fmKoreaHotDealPeriodically } from './src/schedulers/fmkorea-hot-deal-periodically';
import { BrokerPublisher } from './infra/broker/broker-publisher';
import Pyroscope from '@pyroscope/nodejs';

async function bootstrap() {
    // run profiler
    Pyroscope.init({
        serverAddress: 'http://pyroscope:4040',
        appName: 'hotdeal-scrapper',
    });
    Pyroscope.start();

    // start broker - publisher
    await BrokerPublisher.start();

    // start scrapping job
    await ppomppuHotDealPeriodically();
    await fmKoreaHotDealPeriodically();
}

bootstrap();
