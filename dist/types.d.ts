export interface IDB {
    idb: IDBDatabase | null;
    name: string;
    version: number;
    stores: IStore[];
    push: IPush;
    pull: IPull;
    close(): any;
    delete(): Promise<any>;
    onUpgradeNeeded(event: Event): any;
    open(callback: (error?: Error, db?: IDBDatabase) => void): any;
    ready(callback: (error?: Error, db?: IDBDatabase) => void): any;
    sync(target: ISynchronizable): any;
    store(name: string, options: IStoreDefinition): any;
    transaction(storeNames: string[], type: string, callback: (error?: Error, transaction?: IDBTransaction) => void): any;
}
export interface IDBOptions {
    version: number;
    stores?: IStore[];
}
export interface ISynchronizable {
    push: IPush;
    pull: IPull;
}
export interface IPull {
    receive(updates: IUpdate[] | IUpdate, callback: ICallback): any;
}
export interface IPush {
    targets: IDB[];
    hook(pullTarget: IDB): any;
    publish(updates: IUpdate | IUpdate[], callback: IMultipleErrorsCallback): any;
}
export interface IStoreMap {
    [name: string]: IStore;
}
export interface IIndexedDBPull {
    db: IDB;
    stores(): IStoreMap;
    receive(updates: IUpdate[] | IUpdate, callback: ICallback): any;
}
export declare type IIndexDefinition = string | IStrictIndexDefinition;
export interface IStrictIndexDefinition {
    name: string;
    path?: string;
    paths?: string[];
    field?: string;
    fields?: string[];
    options?: object;
}
export interface IStoreDefinition {
    key: string | IKeyDefinition;
    indexes: IIndexDefinition[];
    upgrade?: (store: IStore) => void;
    testing?: boolean;
}
export interface IStore {
    db: IDB;
    name: string;
    idbStore: IDBObjectStore;
    isSimpleStore: boolean;
    key: string | IKeyDefinition;
    indexes: any[];
    isTestStore: boolean;
    onChange: any;
    customUpgradeFn: (store: IStore) => void | undefined;
    create(db: IDBDatabase, event: Event): any;
    createIndex(index: IIndexDefinition): any;
    upgrade(event: Event): any;
    mode(type: string, callback: ICallback): IDBTransaction;
    readWrite(callback: ICallback): IDBTransaction;
    readOnly(callback: ICallback): IDBTransaction;
    all(): Promise<object>;
    add(doc: object, callback?: ICallback): Promise<object>;
    delete(id: any, callback?: ICallback): Promise<object>;
    get(key: any): Promise<object>;
    cursor(range: IRange, direction: string, callback: ICallback): any;
    getByIndex(indexName: any, indexValue: any): any;
    update(doc: object): any;
    count(): Promise<number>;
    range(options: IRange): IRange | IDBKeyRange;
    indexCursor(name: string, range: IRange, direction: string, callback: ICallback): any;
    select(indexName: string, rangeOptions: null | IRange, directionOrCallback: string | ICallback, optionalCallback?: ICallback): any;
    _add(doc: object, callback?: ICallback, resolve?: IResolveFn, reject?: IRejectFn, push?: IPushFn): any;
    _delete(id: any, callback: ICallback, resolve?: IResolveFn, reject?: IRejectFn, push?: IPushFn): any;
    _update(doc: object, callback?: ICallback, resolve?: IResolveFn, reject?: IRejectFn, push?: IPushFn): any;
}
export interface IKeyDefinition {
    keyPath: string;
    autoIncrement?: boolean;
}
export interface IRange {
    from?: any;
    to?: any;
    only?: any;
}
export interface IUpdate {
    action: string;
    store: string;
    id?: any;
    documentId?: any;
    doc?: any;
}
export interface IResolveFn {
    (result: any): void;
}
export interface IRejectFn {
    (error: Error): void;
}
export interface ICallback {
    (error?: Error, result?: any): void;
}
export interface IMultipleErrorsCallback {
    (errors?: Error[], result?: any): void;
}
export interface IPushFn {
    (result: any): void;
}
