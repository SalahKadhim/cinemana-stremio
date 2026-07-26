class Cache {

    constructor() {
        this.store = new Map();
    }

    get(key) {

        const item = this.store.get(key);

        if (!item)
            return null;

        if (Date.now() > item.expire) {

            this.store.delete(key);

            return null;

        }

        return item.value;

    }

    set(key, value, ttlSeconds = 300) {

        this.store.set(key, {

            value,

            expire: Date.now() + ttlSeconds * 1000

        });

    }

    delete(key) {

        this.store.delete(key);

    }

    clear() {

        this.store.clear();

    }

    size() {

        return this.store.size;

    }

}

module.exports = new Cache();