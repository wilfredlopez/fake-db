import { FilterQuery, UpdateQuery } from 'mongoose'
import {
  DataWithId,
  KeyoFQuery,
  MongooseDevDocument,
  SupportedQueryStrings,
} from '.'

export function isQueryString<T extends MongooseDevDocument<DataWithId<{}>>>(
  doc: UpdateQuery<T> | FilterQuery<T>
) {
  const reg = /^\$.*/

  let last: KeyoFQuery | undefined
  for (let key in doc) {
    const match = reg.test(key)
    if (match) {
      last = key as any
    }
  }
  return last
}

export function isMatchFunction<T>(obj: T, where: Partial<T>) {
  let allMatch = true
  for (let val of Object.values(obj)) {
    for (let key in where) {
      const prop = where[key as keyof typeof where]
      if (prop !== val) {
        allMatch = false
        break
      }
    }
  }
  return allMatch
}

export const SUPPORTED_QS: SupportedQueryStrings[] = ['$where', '$set']
export function isSupportedQueryString(
  key: string | undefined
): key is SupportedQueryStrings {
  return (
    typeof key !== 'undefined' &&
    SUPPORTED_QS.includes(key as SupportedQueryStrings)
  )
}

type EmptyObject = never

export function isEmptyObject<T extends {} = {}>(obj: T): obj is EmptyObject {
  return Object.keys(obj).length === 0
}
