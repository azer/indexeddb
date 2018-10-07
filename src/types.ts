export interface IDB {
  idb: IDBDatabase | null
  name: string
  version: number
  stores: IStore[]
  push: IPush
  pull: IPull

  close()
  delete(): Promise<any>
  onUpgradeNeeded(event: Event)
  open(callback: (error?: Error, db?: IDBDatabase) => void)
  ready(callback: (error?: Error, db?: IDBDatabase) => void)
  sync(target: ISynchronizable)
  store(name: string, options: IStoreDefinition)
  transaction(
    storeNames: string[],
    type: string,
    callback: (error?: Error, transaction?: IDBTransaction) => void
  )
}

export interface IDBOptions {
  version: number
  stores?: IStore[]
}

export interface ISynchronizable {
  push: IPush
  pull: IPull
}

export interface IPull {
  receive(updates: IUpdate[] | IUpdate, callback: ICallback)
}

export interface IPush {
  targets: IDB[]
  hook(pullTarget: IDB)
  publish(updates: IUpdate | IUpdate[], callback: IMultipleErrorsCallback)
}

export interface IStoreMap {
  [name: string]: IStore
}

export interface IIndexedDBPull {
  db: IDB
  stores(): IStoreMap
  receive(updates: IUpdate[] | IUpdate, callback: ICallback)
}

export type IIndexDefinition = string | IStrictIndexDefinition

export interface IStrictIndexDefinition {
  name: string
  path?: string
  paths?: string[]
  field?: string
  fields?: string[]
  options?: object
}

export interface IStoreDefinition {
  key: string | IKeyDefinition
  indexes: IIndexDefinition[]
  upgrade?: (store: IStore) => void
  testing?: boolean
}

export interface IStore {
  db: IDB
  name: string
  idbStore: IDBObjectStore
  isSimpleStore: boolean
  key: string | IKeyDefinition
  indexes: any[]
  isTestStore: boolean
  onChange: any

  customUpgradeFn: (store: IStore) => void | undefined

  create(db: IDBDatabase, event: Event)
  createIndex(index: IIndexDefinition)
  upgrade(event: Event)
  mode(type: string, callback: ICallback): IDBTransaction
  readWrite(callback: ICallback): IDBTransaction
  readOnly(callback: ICallback): IDBTransaction
  all(): Promise<object>
  add(doc: object, callback?: ICallback): Promise<object>
  delete(id: any, callback?: ICallback): Promise<object>
  get(key: any): Promise<object>
  cursor(range: IRange, direction: string, callback: ICallback)
  getByIndex(indexName: any, indexValue: any)
  update(doc: object)
  count(): Promise<number>
  range(options: IRange): IRange | IDBKeyRange

  indexCursor(
    name: string,
    range: IRange,
    direction: string,
    callback: ICallback
  )

  select(
    indexName: string,
    rangeOptions: null | IRange,
    directionOrCallback: string | ICallback,
    optionalCallback?: ICallback
  )

  _add(
    doc: object,
    callback?: ICallback,
    resolve?: IResolveFn,
    reject?: IRejectFn,
    push?: IPushFn
  )
  _delete(
    id: any,
    callback: ICallback,
    resolve?: IResolveFn,
    reject?: IRejectFn,
    push?: IPushFn
  )
  _update(
    doc: object,
    callback?: ICallback,
    resolve?: IResolveFn,
    reject?: IRejectFn,
    push?: IPushFn
  )
}

export interface IKeyDefinition {
  keyPath: string
  autoIncrement?: boolean
}

export interface IRange {
  from?: any
  to?: any
  only?: any
}

export interface IUpdate {
  action: string
  store: string
  id?: any
  documentId?: any
  doc?: any
}

export interface IResolveFn {
  (result: any): void
}

export interface IRejectFn {
  (error: Error): void
}

export interface ICallback {
  (error?: Error, result?: any): void
}

export interface IMultipleErrorsCallback {
  (errors?: Error[], result?: any): void
}

export interface IPushFn {
  (result: any): void
}
