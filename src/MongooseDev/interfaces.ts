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

export type KeyoFQuery =
  | '$currentDate'
  | '$inc'
  | '$min'
  | '$max'
  | '$mul'
  | '$rename'
  | '$set'
  | '$setOnInsert'
  | '$unset'
  | '$addToSet'
  | '$pop'
  | '$pull'
  | '$push'
  | '$pullAll'
  | '$bit'
export type SupportedQueryStrings = '$where' | '$set'

export interface QueryResults {
  n?: number
  nModified?: number
  ok?: number
}
