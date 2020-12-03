import { FilterQuery, UpdateQuery } from 'mongoose'
import {
  WithMongoId,
  KeyoFQuery,
  MongooseDevDocument,
  SupportedQueryStrings,
} from '.'

export function isQueryString<T extends MongooseDevDocument<WithMongoId<{}>>>(
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

export const __extends = (function <
  T extends { new (): any },
  D extends { new (): {} }
>() {
  var extendStatics: (d: T, b: D) => { new (): T & D } = function (
    d: T,
    b: D
  ): { new (): T & D } {
    extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (d: any, b) {
          d.__proto__ = b
        }) ||
      function (d: any, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]
      }
    return extendStatics(d, b)
  }
  return function (d: T, b: D) {
    extendStatics(d, b)
    const __: {
      new (...args: any[]): T & D
    } = function __(this: T & D) {
      this.constructor = d
    } as any
    d.prototype =
      b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
  }
})()
