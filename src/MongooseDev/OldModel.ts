import { ObjectID } from 'mongodb'
import mongoose, {
  CreateQuery,
  FilterQuery,
  //   Model,
  ModelUpdateOptions,
  SaveOptions,
  Schema,
  UpdateQuery,
} from 'mongoose'
import { MongooseDevData, WithMongoId, QueryResults } from './interfaces'
// import mongodb from 'mongodb'
// import { Model } from 'mongoose'
import { MoongooseDevConnection } from './MongooseConnection'
import { MongooseDevDocument } from './MongooseDevDocument'
import { isEmptyObject, isQueryString, isSupportedQueryString } from './utils'

const MODEL_INSTANCES: Record<
  string,
  MongooseDevModelOLD<any> //& { new (): MongooseDevModel<any> }
> = {}

// interface InterfaceReturn<T extends MongooseDevDocument<DataWithId<{}>>> {
//   new (doc: Partial<T>): T
// }

type DocumentType = MongooseDevDocument<WithMongoId<{}>>

export class MongooseDevModelOLD<T extends DocumentType> {
  protected MemoryData: Record<string, Record<string, T>>
  protected refetch = true
  protected modelName: string
  protected schema: Schema<T>
  public isDev: boolean
  protected baseClass: new (...props: any[]) => T
  protected model: mongoose.Model<T, {}>
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
    this.model = mongoose.model<T>(modelName, schema)
    if (MODEL_INSTANCES[modelName]) {
      return MODEL_INSTANCES[modelName] // as MongooseDevModel<T> // & (new () => MongooseDevModel<T>)
    }

    MODEL_INSTANCES[modelName] = this
    return MODEL_INSTANCES[modelName] // as MongooseDevModel<T> //& (new () => MongooseDevModel<T>)
  }

  protected get connection() {
    return new MoongooseDevConnection<T, MongooseDevData<T>>()
  }

  /**
   * Create a document but doesnt save it.
   * this replaces the new Model() method.
   * use .save() in order to save it.
   * @param doc partial T
   */
  createRaw(doc: Partial<T>) {
    return this.createInstance(doc)
  }

  //To make sure i give the proper values
  protected createInstance(data: Partial<T> | CreateQuery<T>) {
    let id = ObjectID.createFromTime(new Date().getTime())
    if (data._id) {
      id = new ObjectID(data._id)
    }
    const obj = new this.baseClass({
      ...data,
      _id: id,
      modelName: this.modelName,
    }) as T

    return obj
  }
  protected createInstanceArray(dataArray: T[]) {
    const output: T[] = []
    for (let data of dataArray) {
      const obj = this.createInstance(data)
      output.push(obj)
    }
    return output
  }

  static getInstance<T extends MongooseDevDocument<{ _id: ObjectID }>>(
    modelName: string
  ): MongooseDevModelOLD<T> | null {
    if (MODEL_INSTANCES[modelName]) {
      return MODEL_INSTANCES[modelName]
    }
    return null
  }

  protected set _data(val: Record<string, Record<string, T>>) {
    this.MemoryData = val
    // this.save()
  }

  protected get _data(): Record<string, Record<string, T>> {
    if (this.refetch) {
      let data: Record<string, Record<string, T>> =
        (this.connection.retrive(true) as any) || ({} as any)

      if (Object.keys(data).length === 0) {
        data[this.modelName] = {}
      }
      if (data[this.modelName] === undefined) {
        data[this.modelName] = {}
      }

      let output = { ...data }
      for (let key in output[this.modelName]) {
        const val = output[this.modelName][key]
        output[this.modelName][key] = this.createInstance(val)
      }
      // this.#refetch = false
      this.MemoryData = { ...output }
      return output
    }
    return this.MemoryData
  }

  protected get data() {
    return this._data[this.modelName] as Record<string, T>
  }

  async exists(
    filter: FilterQuery<T>,
    callback?: (err: any, res: boolean) => void
  ) {
    if (!this.isDev) {
      return this.model.exists(filter, callback)
    }
    const { $conditions } = this.getTransformedConditions(filter, {})
    filter = $conditions
    if (filter._id) {
      return this._data[filter._id.toString()] !== undefined
    } else {
      const data = await this.findOne(filter)
      const exists = data !== null
      if (!exists) {
        if (callback) {
          callback('Not Found.', false)
        }
        return false
      } else {
        if (callback) {
          callback(undefined, true)
        }
        return true
      }
    }
  }

  async find(
    where: FilterQuery<T>,
    callback?: (err: any, res: T[]) => void
  ): Promise<T[]> {
    if (!this.isDev) {
      return this.model.find(where, callback)
    }

    const { $conditions } = this.getTransformedConditions(where, {})
    where = $conditions
    if (isEmptyObject(where)) {
      return this.createInstanceArray(Object.values(this.data))
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
  ): Promise<null | T>
  async findOne(
    where: FilterQuery<T>,
    callback?: (err: any, res: T | null) => void
  ): Promise<T>
  async findOne(
    where: FilterQuery<T>,
    callback?: (err: any, res: T | null) => void
  ): Promise<null>
  async findOne(
    where: FilterQuery<T>,
    callback?: (err: any, res: T | null) => void
  ): Promise<T | null | undefined> {
    if (!this.isDev) {
      return this.model.findOne(where, callback)
    }
    const { $conditions } = this.getTransformedConditions(where, {})

    where = $conditions
    if (isEmptyObject(where)) {
      console.error('findOne most not be called with an empty object {}')
      return Object.values(this.data)[0]
    }

    if (where._id) {
      return new Promise<T | null | undefined>(res => {
        const obj = this.data[where._id as string]
        if (!obj) {
          res(null)
        }
        const val = this.createInstance(obj)
        return res(val)
      })
    } else {
      return new Promise<T | null | undefined>(res => {
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
              return res(obj)
            }
          }
        }
        return res(null)
      })
    }
  }

  findById(
    id: string | ObjectID,
    callback?: (err: any, res: T | null) => void
  ) {
    if (!this.isDev) {
      return this.model.findById(id, callback)
    }
    let result: T | null = null
    if (this.data[String(id)]) {
      result = this.createInstance(this.data[String(id)])
    }
    if (callback) {
      callback(result ? undefined : 'Not Found.', result)
    }
    return new Promise<T | null>(res => {
      if (!result) {
        res(null)
      } else {
        const obj = Object.assign({}, result) as T
        res(obj)
      }
    })
  }

  protected getTransformedConditions(
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>
  ) {
    const ksFilter = isQueryString(conditions)
    const isSupportedCondition = isSupportedQueryString(ksFilter)
    let $conditions = conditions
    if (ksFilter && isSupportedCondition) {
      $conditions = conditions[ksFilter]
    }
    if (ksFilter && !isSupportedQueryString(ksFilter)) {
      throw new Error(`This query is not supported yet: ${ksFilter}`)
    }
    let $doc: Partial<T> = doc as any
    const docQS = isQueryString(doc)
    const isSupportedDoc = isSupportedQueryString(docQS)
    if (docQS && isSupportedDoc) {
      $doc = doc[docQS] as any
    }
    if (docQS && !isSupportedDoc) {
      throw new Error(`This query is not supported yet: ${docQS}`)
    }
    return {
      $conditions,
      $doc,
    }
  }

  async updateOne(
    // updated: DataWithId<T>,
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options: ModelUpdateOptions = {}
  ): Promise<QueryResults> {
    let output: QueryResults = {
      nModified: 0,
      n: 0,
      ok: 0,
    }
    if (!this.isDev) {
      output = await this.model.updateOne(conditions, doc, options).exec()
    } else {
      const { $conditions, $doc } = this.getTransformedConditions(
        conditions,
        doc
      )

      let existinDocument = await this.findOne($conditions)
      if (!existinDocument) {
        return output
      }
      //for some reason it doesnt work if i dont use a copy
      existinDocument = { ...existinDocument }
      Object.assign(existinDocument, $doc)
      const inteface = this.createInstance(existinDocument)
      //   for (let key in $doc) {
      //     Object.defineProperty(inteface, key, {
      //       value: $doc[key],
      //     })
      //   }

      this._data[this.modelName][String(inteface._id)] = inteface

      await this.save()
      output = { n: 1, nModified: 1, ok: 1 }
    }
    return output
  }

  /**
   * Updates all the documents found with conditions
   *
   * */
  async updateMany(
    // updated: DataWithId<T>[],
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options: ModelUpdateOptions = {}
  ): Promise<{ ok: number; n: number; nModified: number } | undefined> {
    if (!this.isDev) {
      return this.model.updateMany(conditions, doc, options)
    } else {
      return new Promise(async res => {
        const { $conditions, $doc } = this.getTransformedConditions(
          conditions,
          doc
        )
        const output: { ok: number; n: number; nModified: number } = {
          ok: 1,
          n: 0,
          nModified: 0,
        }
        const documents = await this.find($conditions)
        output.n = documents.length
        output.ok = documents.length > 0 ? 1 : 0
        let modified: T[] = []

        for (let existin of documents) {
          existin = { ...existin }
          let isMod = false
          for (let key in $doc) {
            if (existin[key as keyof T] !== $doc[key]) {
              isMod = true
              Object.defineProperty(existin, key, {
                value: $doc[key],
              })
            }
          }
          if (isMod) {
            modified.push(existin)
          }
        }
        output.nModified = modified.length
        for (let toSave of modified) {
          const updated = this.createInstance(toSave)
          await updated.save()
          this._data[this.modelName][String(toSave._id)] = updated
        }
        res(output)
      })
    }
  }

  /**
   * Updates the first document found with conditions
   *
   * */
  async update(
    // updated: DataWithId<T>[],
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options: ModelUpdateOptions = {}
  ): Promise<{ ok: number; n: number; nModified: number } | undefined> {
    if (!this.isDev) {
      return this.model.update(conditions, doc, options)
    } else {
      return new Promise(async res => {
        const { $conditions, $doc } = this.getTransformedConditions(
          conditions,
          doc
        )
        const output: { ok: number; n: number; nModified: number } = {
          ok: 1,
          n: 0,
          nModified: 0,
        }
        const documents = await this.find($conditions)
        const modified: T[] = []
        output.n = documents.length

        let existin = documents[0]
        if (!existin) {
          output.ok = 0
          res(output)
          return output
        }
        existin = { ...existin }
        let isMod = false
        for (let key in $doc) {
          if (existin[key as keyof T] !== $doc[key]) {
            isMod = true
            Object.defineProperty(existin, key, {
              value: $doc[key],
            })
          }
          if (isMod) {
            modified.push(existin)
          }
        }
        output.nModified = modified.length
        for (let toSave of modified) {
          this._data[this.modelName][String(toSave._id)] = this.createInstance(
            toSave
          )
        }
        this.save()
        res(output)
        return output
      })
    }
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
    await obj.save()
    this._data[this.modelName] = this._data[this.modelName] || {}
    this._data[this.modelName][obj._id.toHexString()] = obj

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
    this.MemoryData = {
      [this.modelName]: {},
    }
    this.save()
    return this
  }

  async findByIdAndRemove(id: WithMongoId<T>['_id']) {
    if (!this.isDev) {
      return this.model.findByIdAndRemove(id)
    }
    const val = this.data[String(id)]
    delete this._data[this.modelName][String(id)]

    await this.save()
    return val
  }

  async deleteOne(
    where: FilterQuery<T>
  ): Promise<
    { ok?: number | undefined; n?: number | undefined } & {
      deletedCount?: number | undefined
    }
  > {
    if (this.isDev) {
      const { $conditions } = this.getTransformedConditions(where, {})
      const obj = await this.findOne($conditions)
      if (obj && typeof obj !== null) {
        const res = this.findByIdAndRemove(obj['_id'])
        if (res) {
          return { deletedCount: 1, ok: 1, n: 1 }
        }
        return { deletedCount: 0, ok: 0, n: 0 }
      } else {
        return { deletedCount: 0, ok: 0, n: 0 }
      }
    }
    return this.model.deleteOne(where)
  }

  async deleteMany(conditions: FilterQuery<T>) {
    if (!this.isDev) {
      return this.model.deleteMany(conditions)
    } else {
      const { $conditions } = this.getTransformedConditions(conditions, {})
      const data = await this.find($conditions)
      for (let d of data) {
        this.findByIdAndRemove(d._id)
      }
    }
    return new Promise<this>(res => res(this))
  }

  async save() {
    if (this.isDev) {
      this.connection.saveFull(this.modelName, this.MemoryData)
    }
    return this
  }
}
