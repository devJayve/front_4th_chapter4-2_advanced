type FetchFunction<T> = () => Promise<T>;

export const createCacheFetcher = <T>(fetchFunction: FetchFunction<T>): FetchFunction<T> => {
    let cache: T | null = null;
    let fetchPromise: Promise<T> | null = null;

    return async ()  => {
        if (cache !== null) {
            return cache;
        }

        if (fetchPromise !== null) {
            return fetchPromise;
        }

        console.log('Cache Miss', fetchFunction.name);
        fetchPromise = fetchFunction().then(result => {
            cache = result;
            return result;
        });

        return fetchPromise;
    };
}
