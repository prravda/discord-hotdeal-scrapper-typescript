import { createLogger, transports, format, Logger } from 'winston';
import LokiTransport from 'winston-loki';

export class LokiLogger {
    private static logger: Logger;

    public static getLogger(): Logger {
        if (!this.logger) {
            this.logger = createLogger({
                transports: [
                    new LokiTransport({
                        host: 'http://loki:3100',
                        labels: {
                            app: 'hotdeal-scrapper',
                        },
                        json: true,
                        format: format.json(),
                        replaceTimestamp: true,
                        onConnectionError: (error: unknown) =>
                            console.error(error),
                    }),
                    new transports.Console({
                        format: format.combine(
                            format.simple(),
                            format.colorize(),
                            format.json()
                        ),
                    }),
                ],
            });
        }

        return this.logger;
    }
}
