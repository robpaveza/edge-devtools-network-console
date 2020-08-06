// Copyright (c) 2020 by Rob Paveza
// Licensed under the MIT License

import { ICollectionAdapter, ICollectionItemAdapter } from 'network-console-shared';
import { SINGLETON_ID } from '../util/singleton-manager';

type CollectionItemEntry = {
    id: string;
    collection: ICollectionAdapter;
    item: ICollectionItemAdapter;
}

export class CollectionMap {
    public static readonly [SINGLETON_ID] = 'CollectionMap';
    private _map = new Map<string, CollectionItemEntry>();
    constructor() {

    }

    public set(id: string, item: ICollectionItemAdapter, collection: ICollectionAdapter) {
        this._map.set(id, { id, item, collection });
    }

    public getItem(id: string): ICollectionItemAdapter | undefined {
        return this._map.get(id)?.item;
    }

    public getCollection(id: string): ICollectionAdapter | undefined {
        return this._map.get(id)?.collection;
    }

    public clear() {
        this._map.clear();
    }
}
