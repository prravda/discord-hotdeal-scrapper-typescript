import crypto from 'node:crypto';

export class LRUCache<T> {
    private values: Map<string, T> = new Map<string, T>();
    private maxEntries: number = 50;

    public createHash(data: string) {
        return crypto
            .createHash('shake256', { outputLength: 15 })
            .update(data)
            .digest('hex');
    }

    public get(key: string) {
        let entry: T | null = null;

        if (this.values.has(key)) {
            entry = this.values.get(key)!;
            this.values.delete(key);
            this.values.set(key, entry);
        }

        return entry;
    }

    public set(key: string, value: T) {
        if (this.values.size >= this.maxEntries) {
            const keyToDelete = this.values.keys().next().value;

            this.values.delete(keyToDelete);
        }

        this.values.set(key, value);
    }

    public size() {
        return this.values.size;
    }
}
