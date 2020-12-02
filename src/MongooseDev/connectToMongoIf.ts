import { MongoError } from 'mongodb'
import mongoose, { ConnectionOptions } from 'mongoose'
import { MoongooseDevConnection } from './MongooseConnection'

interface MongooseDevConnectionOptions {
  isDev: boolean
  mongoUri: string
  devJsonfilePath: string
  options: ConnectionOptions
}

type MongooseDevConnectionReturn =
  | typeof mongoose
  | undefined
  | MoongooseDevConnection<any, any>

export function connectMongoIf(
  { isDev, mongoUri, devJsonfilePath, options }: MongooseDevConnectionOptions,
  callback?: (err?: MongoError, value?: MongooseDevConnectionReturn) => void
): Promise<MongooseDevConnectionReturn> {
  if (isDev) {
    return new Promise(res => {
      const connection = new MoongooseDevConnection(devJsonfilePath)
      if (callback) {
        callback(undefined, connection)
      }
      res(connection)
    })
  }
  if (callback) {
    return mongoose.connect(mongoUri, options, callback)
  }
  return mongoose.connect(mongoUri, options)
}
