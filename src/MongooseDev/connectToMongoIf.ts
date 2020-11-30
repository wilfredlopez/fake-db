import { MongoError } from 'mongodb'
import mongoose, { ConnectionOptions, Mongoose } from 'mongoose'
import { MoongooseDevConnection } from './MongooseConnection'

export function connectMongoIf(
  isProd: boolean,
  uris: string,
  devJsonfilePath: string,
  options: ConnectionOptions,
  callback?: (err?: MongoError) => void
): Promise<Mongoose | undefined | MoongooseDevConnection<any, any>> {
  if (isProd) {
    if (callback) {
      return mongoose.connect(uris, options, callback)
    }
    return mongoose.connect(uris, options)
  }

  return new Promise(res => {
    const connection = new MoongooseDevConnection(devJsonfilePath)
    if (callback) {
      callback(undefined)
    }
    res(connection)
  })
}
