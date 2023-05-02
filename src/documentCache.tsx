

type cacheEntries<T> = {
    [key: string]: T;
};

type promiseResolvers<T> = {
    [key: string]: ((result: T) => void)[];
}

type updateHook<T> = (id: string, value: T) => void;

type updateHookEntries<T> = {
    [key: string]: updateHook<T>;
}

/*type updateHooks<T> = {
    [key: string]: ((result: T) => void)[];
}*/

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}


export default class DocCache<T> {
    downloader: (id: string) => Promise<T>;
    cachedItems: cacheEntries<T> = {};
    promises: promiseResolvers<T> = {};
    cacheUpdateHooks: updateHookEntries<T>;
    maxCacheSize: number;




    constructor(downloader: (id: string) => Promise<T>, maxCacheSize: number = Infinity) {
        this.downloader = downloader;
        this.maxCacheSize = maxCacheSize;
    }


    get(id: string) : Promise<T> {
        if (!id) {
            return Promise.resolve(null);
        }
        if (id in this.cachedItems) {
            return Promise.resolve(this.cachedItems[id]);
        }
        

        if (this.promises[id] == null) {
            this.promises[id] = [];
            return this.downloader(id).then(result => {

                this.cachedItems[id] = result;

                const updateKeys = Object.keys(this.cacheUpdateHooks);
                for (let i = updateKeys.length - 1; i >= 0; i--) {
                    this.cacheUpdateHooks[i](id, result);
                }

                if (this.promises[id].length > 0) {
                    for (let i = this.promises[id].length - 1; i >= 0; i--) {
                        this.promises[id][i]?.(result);
                    }
                    this.promises[id] = null;
                }

                let keys = Object.keys(this.cachedItems);

                if (keys.length > this.maxCacheSize) {
                    for (let i = keys.length - 1; i >= this.maxCacheSize; i--) {
                        delete this.cachedItems[keys[i]];
                    }
                }

                return result;
            }).catch(error => {
                console.error(error);

                return null;
            });
        }
        else {
            return new Promise<T>((resolve, reject) => {
                if (id in this.cachedItems) {
                    resolve(this.cachedItems[id]);
                }
                else {
                    this.promises[id].push(resolve);
                }
            })
        }
    }

    clearCache() {
        this.cachedItems = {};
    }

    updateEntry(id: string, value: T) {
        if (!id) {
            return;
        }

        this.cachedItems[id] = value;

        const updateKeys = Object.keys(this.cacheUpdateHooks);
        for (let i = updateKeys.length - 1; i >= 0; i--) {
            this.cacheUpdateHooks[i](id, value);
        }
    }

    addCacheUpdateHook(hook: (id: string, value: T) => void) {
        const guid = guidGenerator();

        this.cacheUpdateHooks[guid] = hook;

        return () => {
            delete this.cacheUpdateHooks[guid];
        };
    }

    
}