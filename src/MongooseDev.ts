import fs from 'fs'

// import { v4 } from 'uuid'
import mongoose, {
  ConnectionOptions,
  Schema,
  FilterQuery,
  ModelUpdateOptions,
  UpdateQuery,
  CreateQuery,
  SaveOptions,
  Mongoose,
  Document as DocumentInterface,
} from 'mongoose'
import { MongoError, ObjectID } from 'mongodb'
import { DocumentProvider } from 'mongoose'
// import { Model } from 'mongoose'

const Document = DocumentProvider as new () => DocumentInterface

console.log(typeof Document, 'typeof Doc')

export function connectMongoIf(
  isProd: boolean,
  uris: string,
  options: ConnectionOptions,
  callback?: (err?: MongoError) => void
): Promise<Mongoose | undefined> {
  if (isProd) {
    if (callback) {
      return mongoose.connect(uris, options, callback)
    }
    return mongoose.connect(uris, options)
  }
  if (callback) {
    callback(undefined)
  }
  return new Promise(res => res(undefined))
}

export type WhereType<T extends {}> = {
  [K in keyof T]?: T[K]
}

function isMatchFunction<T>(obj: T, where: FilterQuery<T>) {
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
export type DataWithId<T extends {}> = T & { _id: ObjectID }

class Connection<D extends { _id: ObjectID }, T extends DataInterface<D>> {
  /**
   *
   * @param fileUrl JSON FILE URL.
   */
  constructor(public fileUrl: string) {
    if (!fileUrl.endsWith('.json')) {
      throw new Error('File URL for FakeBb most end with .json')
    }
  }
  public retrive() {
    const data = fs.readFileSync(this.fileUrl, {
      encoding: 'utf-8',
      flag: 'a+',
    })
    if (data) {
      return JSON.parse(data) as T
    }
    return {} as T
  }
  update(obj: DataWithId<D>) {
    const data = this.retrive() as any
    data[obj._id.toHexString()] = obj
    this.save(data)
  }
  remove(obj: DataWithId<D>) {
    const data = this.retrive() as any
    delete data[obj._id.toHexString()]
    this.save(data)
  }
  public save(obj: T) {
    const data = JSON.stringify(obj)
    fs.writeFileSync(this.fileUrl, data)
    return this
  }
}

// type DataInterface<T> = { [key: string]: DataWithId<T> }
type DataInterface<T> = Record<string, DataWithId<T>>

interface MongooseDevContructor<T extends MongooseDevNode> {
  fileUrl: string
  modelName: string
  schema: Schema<T>
  isDev: boolean
  baseClass: new (...props: any[]) => T
}

export default class MongooseDev<T extends MongooseDevNode> {
  private data: DataInterface<T>
  model: mongoose.Model<T, {}>
  /**
   *
   * @param fileUrl JSON FILE URL.
   */
  private connection: Connection<T, DataInterface<T>>
  public fileUrl: string
  modelName: string
  schema: Schema<T>
  public isDev: boolean
  protected baseClass: new (...props: any[]) => T

  constructor({
    fileUrl,
    baseClass,
    isDev,
    modelName,
    schema,
  }: MongooseDevContructor<T>) {
    if (!fileUrl.endsWith('.json')) {
      throw new Error('File URL for FakeBb most end with .json')
    }
    this.baseClass = baseClass
    this.isDev = isDev
    this.connection = new Connection<T, DataInterface<T>>(fileUrl)
    this.model = mongoose.model<T>(modelName, schema)
    this.data = this.connection.retrive()
    for (let key in this.data) {
      this.data[key] = new this.baseClass({
        ...this.data[key],
        _id: new ObjectID(this.data[key]._id),
        connection: this.connection,
        isDev: this.isDev,
      })
    }
  }

  async exists(
    filter: FilterQuery<T>,
    callback?: (err: any, res: boolean) => void
  ) {
    if (!this.isDev) {
      return this.model.exists(filter, callback)
    }

    if (filter._id) {
      return this.data[filter._id as string] !== undefined
    } else {
      for (let obj of Object.values(this.data)) {
        if (isMatchFunction(obj, filter)) {
          if (callback) {
            callback(undefined, true)
          }
          return true
        }
      }
      if (callback) {
        callback(undefined, false)
      }
      return false
    }
  }

  async find(
    where: FilterQuery<T>,
    callback?: (err: any, res: T[]) => void
  ): Promise<T[]> {
    if (!this.isDev) {
      return this.model.find(where, callback)
    }
    const result: T[] = []
    if (where._id) {
      result.push(this.data[where._id as string])
    } else {
      for (let obj of Object.values(this.data)) {
        for (let val of Object.values(obj)) {
          let allMatch = true
          for (let key in where) {
            const prop = where[key as keyof typeof where]
            if (prop !== val) {
              allMatch = false
            }
          }
          if (allMatch) {
            result.push(obj)
          }
        }
      }
    }
    return new Promise(res => res(result))
  }

  async findOne(
    where: FilterQuery<T>,
    callback?: (err: any, res: T | null) => void
  ): Promise<T | null | undefined> {
    if (!this.isDev) {
      return this.model.findOne(where, callback)
    }
    if (where._id) {
      return new Promise(res => res(this.data[where._id as string]))
    } else {
      for (let obj of Object.values(this.data)) {
        for (let val of Object.values(obj)) {
          let allMatch = true
          for (let key in where) {
            const prop = where[key as keyof typeof where]
            if (prop !== val) {
              allMatch = false
              break
            }
          }
          if (allMatch) {
            return new Promise(res => res(obj))
          }
        }
      }
      return new Promise(res => res(null))
    }
  }

  findById(id: string, callback?: (err: any, res: T | null) => void) {
    if (!this.isDev) {
      return this.model.findById(id, callback)
    }

    if (callback) {
      callback(undefined, this.data[id])
    }
    const obj = Object.assign({}, this.data[id])
    return new Promise<T>(res => res(obj))
  }

  async updateOne(
    updated: DataWithId<T>,
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options: ModelUpdateOptions = {}
  ) {
    let output: DataWithId<T> | undefined = undefined
    if (!this.isDev) {
      output = await this.model.updateOne(conditions, doc, options).exec()
    } else {
      this.data[updated._id.toHexString()] = updated
      this.save()
    }
    return output
  }
  async update(
    updated: DataWithId<T>[],
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options: ModelUpdateOptions = {}
  ) {
    if (!this.isDev) {
      return this.model.update(conditions, doc, options)
    } else {
      for (let obj of updated) {
        this.updateOne(obj, conditions, doc, options)
      }
    }

    return new Promise(res => res(this))
  }

  /**
   *
   * @param data object to save
   * @param shouldCreate [Optional] condition to determine if object already exists. if exists it will not be added again.
   */
  async create(data: CreateQuery<T>, options?: SaveOptions): Promise<T> {
    if (!this.isDev) {
      return this.model.create(data, options)
    }

    // const id = v4()
    const id = ObjectID.createFromTime(new Date().getTime())
    const obj = new this.baseClass({
      ...data,
      connection: this.connection,
      isDev: this.isDev,
      _id: id,
    } as T)
    this.data[id.toHexString()] = obj
    this.connection.save(this.data)
    return new Promise(res => res(this.data[id.toHexString()]))
  }

  createMany(data: CreateQuery<T>[], options?: SaveOptions) {
    let created = []
    let current
    for (let obj of data) {
      current = this.create(obj, options)
      created.push(current)
    }
    return created
  }

  clearDatabase() {
    if (!this.isDev) {
      this.model.deleteMany({})
      return this
    }
    this.data = {}
    this.save()
    return this
  }

  findByIdAndRemove(id: DataWithId<T>['_id']) {
    if (!this.isDev) {
      return this.model.findByIdAndRemove(id)
    }
    const val = this.data[id.toHexString()]
    delete this.data[id.toHexString()]
    this.save()
    return val
  }

  async deleteOne(where: FilterQuery<T>) {
    const obj = await this.findOne(where)
    if (obj && typeof obj !== null) {
      return this.findByIdAndRemove(obj['_id'] as any)
    } else {
      return obj
    }
  }

  async deleteMany(conditions: FilterQuery<T>) {
    if (!this.isDev) {
      this.model.deleteMany(conditions)
    } else {
      const data = await this.find(conditions)
      for (let d of data) {
        this.findByIdAndRemove(d._id)
      }
    }
    return new Promise<this>(res => res(this))
  }

  save() {
    if (this.isDev) {
      this.connection.save(this.data)
    }
    return this
  }
}

type NodeContructor<T extends { _id: ObjectID }> = {
  connection: Connection<MongooseDevNode<T>, DataInterface<MongooseDevNode<T>>>
  isDev: boolean
} & PropertiesOf<T>

type PropertiesOf<T extends {}> = {
  [P in keyof T]: T[P]
}

export class MongooseDevNode<
  T extends { _id: ObjectID } = { _id: ObjectID }
> extends Document {
  _id: ObjectID
  isDev?: boolean = true

  protected connection: Connection<
    MongooseDevNode<T>,
    DataInterface<MongooseDevNode<T>>
  >

  constructor({ _id, connection, isDev, ...rest }: NodeContructor<T>) {
    super()
    this.isDev = isDev
    this.connection = connection
    if (_id) {
      this._id = _id
    }
    Object.defineProperty(this, '_eventsCount', {
      enumerable: false,
    })
    Object.defineProperty(this, 'connection', {
      enumerable: false,
      value: this.connection,
    })
    Object.defineProperty(this, 'isDev', {
      enumerable: false,
      value: this.isDev,
    })
    for (let [key, value] of Object.entries(rest)) {
      this[key as keyof this] = value as any
    }
  }

  remove(fn?: (err: any, product: this) => void): Promise<this> {
    if (!this.isDev) {
      super.remove(fn)
    } else {
      this.connection.remove(this)
      if (fn) {
        fn(undefined, this)
      }
    }
    return new Promise<this>(res => res(this))
  }
  deleteOne(fn?: (err: any, product: this) => void): Promise<this> {
    if (!this.isDev) {
      return super.deleteOne(fn)
    }
    return this.remove(fn)
  }
  __v?: number | undefined

  modifiedPaths(): string[] {
    throw new Error('Method not implemented.')
  }
  update(
    doc: this,
    callback?: (err: any, raw: any) => void
  ): mongoose.Query<any>
  update(
    doc: this,
    options: mongoose.ModelUpdateOptions,
    callback?: (err: any, raw: any) => void
  ): mongoose.Query<any>
  update(doc: this, options?: any, callback?: any) {
    if (!this.isDev) {
      return super.update(doc, options, callback)
    }
    this.connection.update(doc)
    return this as any
  }
  updateOne(
    doc: any,
    callback?: (err: any, raw: any) => void
  ): mongoose.Query<any>
  updateOne(
    doc: any,
    options: mongoose.ModelUpdateOptions,
    callback?: (err: any, raw: any) => void
  ): mongoose.Query<any>
  updateOne(doc: any, options?: any, callback?: any) {
    if (!this.isDev) {
      return super.updateOne(doc, options, callback)
    }
    throw new Error('Method not implemented: updatedOne')
  }

  toJSON() {
    if (!this.isDev) {
      return super.toJSON()
    }
    return this
  }

  toString() {
    if (!this.isDev) {
      return super.toString()
    }
    return JSON.stringify(this)
  }

  async save() {
    if (!this.isDev) {
      return super.save()
    }
    this.connection.update(this)
    return new Promise<this>(res => res(this))
  }
}
