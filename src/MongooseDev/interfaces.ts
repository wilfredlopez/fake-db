import { ObjectID } from 'mongodb'
import { MongooseDevDocument } from './MongooseDevDocument'
export type DataWithId<T extends {}> = T & { _id: ObjectID }

export type DataInterface<T> = Record<
  string,
  Record<string, MongooseDevDocument<DataWithId<T>>>
>

export type WhereType<T extends {}> = {
  [K in keyof T]?: T[K]
}
