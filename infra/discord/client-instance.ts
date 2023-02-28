import { Client, ClientOptions } from 'discord.js';

export class ClientInstance {
    private static clientInstance: Client;

    public static getClient(options?: ClientOptions) {
        if (options && !this.clientInstance) {
            this.clientInstance = new Client(options);
        }
        return this.clientInstance;
    }
}
