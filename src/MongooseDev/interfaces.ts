import { ObjectID } from 'mongodb'
import { MongooseDevDocument } from './MongooseDevDocument'
export type WithMongoId<T extends {}> = T & { _id: ObjectID }

export type MongooseDevData<T> = Record<
  string,
  Record<string, MongooseDevDocument<WithMongoId<T>>>
>

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
export type DocumentType = MongooseDevDocument<WithMongoId<{}>>
