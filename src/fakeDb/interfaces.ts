export type DataWithId<T extends {}> = T & { _id: string }

export type DataInterface<T> = Record<string, Record<string, DataWithId<T>>>

export type WhereType<T extends {}> = {
  [K in keyof T]?: T[K]
}
