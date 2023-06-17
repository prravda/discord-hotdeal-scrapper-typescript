import { memphis, Memphis, Producer } from 'memphis-dev';
import { ENV_LIST } from '../env-config';

export class BrokerPublisher {
    private static memphisConnection: Memphis;
    private static memphisProducer: Producer;

    public static async start() {
        if (!this.memphisConnection) {
            this.memphisConnection = await memphis.connect({
                host: 'memphis',
                username: ENV_LIST.MEMPHIS_USER_HOT_DEAL_USER_NAME,
                password: ENV_LIST.MEMPHIS_USER_HOT_DEAL_PASSWORD,
            });
        }
    }

    public static async get() {
        if (!this.memphisProducer) {
            this.memphisProducer = await this.memphisConnection.producer({
                stationName: ENV_LIST.MEMPHIS_STATION_NAME,
                producerName: ENV_LIST.MEMPHIS_PRODUCER_NAME,
            });
        }

        return this.memphisProducer;
    }
}
