import { ObjectID } from 'mongodb'
import mongoose, {
  CreateQuery,
  FilterQuery,
  ModelUpdateOptions,
  SaveOptions,
  Schema,
  UpdateQuery,
} from 'mongoose'
import { DataInterface, DataWithId } from './interfaces'
// import { Model } from 'mongoose'
import { MoongooseDevConnection } from './MongooseConnection'
import { MongooseDevDocument } from './MongooseDevDocument'
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

export class MongooseDevModel<T extends MongooseDevDocument<DataWithId<{}>>> {
  private _data: Record<string, Record<string, T>>
  // private data: DataInterface<T>
  private model: mongoose.Model<T, {}>

  protected get connection() {
    return new MoongooseDevConnection<T, DataInterface<T>>()
  }
  // public fileUrl: string
  protected modelName: string
  protected schema: Schema<T>
  public isDev: boolean
  protected baseClass: new (...props: any[]) => T

  //To make sure i give the proper values
  private createInstance(data: CreateQuery<T>) {
    const id = ObjectID.createFromTime(new Date().getTime())
    const obj = new this.baseClass({
      _id: id,
      ...data,
      modelName: this.modelName,
      isDev: this.isDev,
    }) as T

    return obj
  }

  constructor(
    modelName: string,
    schema: Schema<T>,
    baseClass: new (...props: any[]) => T,
    isDev = true
  ) {
    this.modelName = modelName
    this.schema = schema
    this.isDev = isDev
    this.baseClass = baseClass
    // this.connection = new MoongooseDevConnection<DataInterface<T>>()
    this.model = mongoose.model<T>(modelName, schema)
    this._data = (this.connection.retrive()[modelName] as any) || ({} as any)
    let shouldInitialize = false
    if (Object.keys(this._data).length === 0) {
      shouldInitialize = true
    }
    if (!shouldInitialize) {
      if (this._data[modelName] === undefined) {
        shouldInitialize = true
      }
    }
    if (shouldInitialize) {
      this._data = {}
      this.save()
    }

    //new baseClass?
    for (let key in this._data[modelName]) {
      this._data[modelName][key] = {
        ...this._data[modelName][key],
        _id: new ObjectID(this._data[modelName][key]._id),
        // connection: this.connection,
        isDev: this.isDev,
      }
    }
  }

  get data() {
    return this._data[this.modelName] as Record<string, T>
  }

  async exists(
    filter: FilterQuery<T>,
    callback?: (err: any, res: boolean) => void
  ) {
    if (!this.isDev) {
      return this.model.exists(filter, callback)
    }

    if (filter._id) {
      return this._data[filter._id.toString()] !== undefined
    } else {
      for (let obj of Object.values(this.data)) {
        if (isMatchFunction(obj, filter as any)) {
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
    if (Object.keys(where).length === 0) {
      return Object.values(this.data)
    }
    const result: T[] = []
    if (where._id) {
      result.push(this.data[where._id.toString()])
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
    if (Object.keys(where).length === 0) {
      return Object.values(this.data)[0]
    }
    if (!this.isDev) {
      return this.model.findOne(where, callback)
    }
    if (where._id) {
      return new Promise(res => {
        const val = this.createInstance(this.data[where._id as string] as any)
        res(val)
      })
    } else {
      return new Promise(res => {
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
              res(obj)
              break
            }
          }
        }
        res(null)
      })
    }
  }

  findById(id: string, callback?: (err: any, res: T | null) => void) {
    if (!this.isDev) {
      return this.model.findById(id, callback)
    }

    if (callback) {
      callback(undefined, this.data[id])
    }
    return new Promise<T>(res => {
      const obj = Object.assign({}, this.data[id])
      res(obj)
    })
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
      this._data[this.modelName][updated._id.toHexString()] = updated
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
    const obj = this.createInstance(data)

    this._data[this.modelName] = this._data[this.modelName] || {}
    this._data[this.modelName][obj._id.toHexString()] = obj

    // this.connection.save(this.modelName, this._data[this.modelName])
    return new Promise(res => {
      res(obj)
    })
  }

  async createMany(data: CreateQuery<T>[], options?: SaveOptions) {
    let created: Promise<T>[] = []
    let current: Promise<T>
    for (let obj of data) {
      current = this.create(obj, options)
      created.push(current)
    }
    const values = await Promise.all(created)
    return values
  }

  clearDatabase() {
    if (!this.isDev) {
      this.model.deleteMany({})
      return this
    }
    this._data = {}
    this.save()
    return this
  }

  findByIdAndRemove(id: DataWithId<T>['_id']) {
    if (!this.isDev) {
      return this.model.findByIdAndRemove(id)
    }
    const val = this.data[id.toHexString()]
    delete this._data[id.toHexString()]
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
      this.connection.saveFull(this.modelName, this._data)
    }
    return this
  }
}

// class User extends MongooseDevDocument<any> {
//   name: string
// }

// const userSchema = new mongoose.Schema<User>({
//   name: String,
// })

// const UserModel = new MongooseDevModel('User', userSchema, User)

// UserModel.findOne({}).then(u => {
//   console.log(u?._id)
// })
