import { EventEmitter } from 'events'
import { ObjectID } from 'mongodb'
import mongoose, {
  Document,
  // Document,
  // DocumentProvider,
} from 'mongoose'
import { DataInterface } from './interfaces'
import { MoongooseDevConnection } from './MongooseConnection'

// const Document = DocumentProvider() as new () => DocumentInterface
// class Connection<D extends { _id: ObjectID }, T extends DataInterface<D>> {
//   /**
//    *
//    * @param fileUrl JSON FILE URL.
//    */
//   constructor(public fileUrl: string) {
//     if (!fileUrl.endsWith('.json')) {
//       throw new Error('File URL for FakeBb most end with .json')
//     }
//   }
//   public retrive() {
//     const data = fs.readFileSync(this.fileUrl, {
//       encoding: 'utf-8',
//       flag: 'a+',
//     })
//     if (data) {
//       return JSON.parse(data) as T
//     }
//     return {} as T
//   }
//   update(obj: DataWithId<D>) {
//     const data = this.retrive() as any
//     data[obj._id.toHexString()] = obj
//     this.save(data)
//   }
//   remove(obj: DataWithId<D>) {
//     const data = this.retrive() as any
//     delete data[obj._id.toHexString()]
//     this.save(data)
//   }
//   public save(obj: T) {
//     const data = JSON.stringify(obj)
//     fs.writeFileSync(this.fileUrl, data)
//     return this
//   }
// }

// type DataInterface<T> = { [key: string]: DataWithId<T> }

// interface MongooseDevContructor<T extends MongooseDevDocument> {
//   fileUrl: string
//   modelName: string
//   schema: Schema<T>
//   isDev: boolean
//   baseClass: new (...props: any[]) => T
// }

type NodeContructor<T extends { _id: ObjectID }> = {
  // connection: MoongooseDevConnection<DataInterface<MongooseDevDocument<T>>>
  isDev: boolean
  modelName?: string
} & PropertiesOf<T>

type PropertiesOf<T extends {}> = {
  [P in keyof T]: T[P]
}

export class MongooseDevDocument<T extends { _id: ObjectID }>
  extends EventEmitter
  implements Document {
  _id: ObjectID
  isDev?: boolean = true
  modelName?: string
  errors: any
  isNew: boolean
  schema: mongoose.Schema<any>
  $locals: { [k: string]: any }
  id?: any
  collection: mongoose.Collection
  db: mongoose.Connection
  __v?: number | undefined
  // protected connection: MoongooseDevConnection<
  //   DataInterface<MongooseDevDocument<T>>
  // >

  get connection() {
    return new MoongooseDevConnection<T, DataInterface<T>>()
  }

  constructor({ _id, isDev, modelName, ...rest }: NodeContructor<T>) {
    super()
    this.modelName = modelName || ''
    this.isDev = isDev
    // this.connection = connection
    if (_id) {
      this._id = _id
    }
    Object.defineProperty(this, 'modelName', {
      enumerable: false,
      value: modelName || '',
    })
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
      Object.defineProperty(this, key, {
        enumerable: true,
        value: value,
      })
    }
  }
  increment(): this {
    return new Document().increment.bind(this)
  }
  model<T extends mongoose.Document>(name: string): mongoose.Model<T, {}> {
    return new Document().model.bind(this, name)
  }
  $isDeleted(isDeleted: boolean): void
  $isDeleted(): boolean
  $isDeleted(isDeleted?: any) {
    return new Document().$isDeleted.bind(this, isDeleted)
  }
  $isDefault(path?: string): boolean {
    return new Document().$isDefault.bind(this, path)
  }
  $session(session?: mongoose.ClientSession): mongoose.ClientSession {
    return new Document().$session.bind(this, session)
  }
  depopulate(path?: string): this {
    return new Document().depopulate.bind(this, path)
  }
  equals(doc: mongoose.MongooseDocument): boolean {
    return new Document().depopulate.bind(this, doc)
  }
  execPopulate(): Promise<this> {
    return new Document().execPopulate.bind(this)
  }
  isDirectSelected(path: string): boolean {
    return new Document().isDirectSelected.bind(this, path)
  }
  get(
    path: string,
    type?: any,
    options?: { virtuals?: boolean | undefined; getters?: boolean | undefined }
  ) {
    return new Document().get.bind(this, path, type, options)
  }
  init(doc: mongoose.MongooseDocument, opts?: any): this {
    return new Document().init.bind(this, doc, opts)
  }
  inspect(options?: any) {
    return new Document().inspect.bind(this, options)
  }
  invalidate(
    path: string,
    errorMsg: string | mongoose.NativeError,
    value?: any,
    kind?: string
  ): boolean | mongoose.Error.ValidationError {
    return new Document().invalidate.bind(this, path, errorMsg, value, kind)
  }
  isDirectModified(path: string): boolean {
    return new Document().isDirectModified.bind(this, path)
  }
  isInit(path: string): boolean {
    return new Document().isInit.bind(this, path)
  }
  isModified(path?: string): boolean {
    return new Document().isModified.bind(this, path)
  }
  isSelected(path: string): boolean {
    return new Document().isSelected.bind(this, path)
  }
  markModified(path: string): void {
    return new Document().markModified.bind(this, path)
  }
  populate(callback: (err: any, res: this) => void): this
  populate(path: string, callback?: (err: any, res: this) => void): this
  populate(
    path: string,
    names: string,
    callback?: (err: any, res: this) => void
  ): this
  populate(
    options: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[],
    callback?: (err: any, res: this) => void
  ): this
  populate(path: any, names?: any, callback?: any) {
    return new Document().populate.bind(this, path, names, callback)
  }
  populated(path: string) {
    return new Document().populated.bind(this, path)
  }
  set(path: string, val: any, options?: any): this
  set(path: string, val: any, type: any, options?: any): this
  set(value: any): this
  set(path: any, val?: any, type?: any, options?: any) {
    return new Document().set.bind(this, path, val, type, options)
  }
  overwrite(obj: any): this {
    return new Document().overwrite.bind(this, obj)
  }
  toObject(options?: mongoose.DocumentToObjectOptions) {
    return new Document().toObject.bind(this, options)
  }
  unmarkModified(path: string): void {
    return new Document().unmarkModified.bind(this, path)
  }
  replaceOne(
    replacement: any,
    callback?: (err: any, raw: any) => void
  ): mongoose.Query<any> {
    return new Document().replaceOne.bind(this, replacement, callback)
  }
  validate(callback?: (err: any) => void): Promise<void>
  validate(optional: any, callback?: (err: any) => void): Promise<void>
  validate(optional?: any, callback?: any) {
    return new Document().validate.bind(this, optional, callback)
  }
  validateSync(
    pathsToValidate?: string | string[]
  ): mongoose.Error.ValidationError | undefined {
    return new Document().validateSync.bind(this, pathsToValidate)
  }

  private ensureModelName() {
    if (!this.modelName) {
      throw new Error('modelName was not provided')
    }
  }

  remove(fn?: (err: any, product: this) => void): Promise<this> {
    if (!this.isDev) {
      return new Document().remove.bind(this, fn)
      // super.remove(fn)
    } else {
      this.ensureModelName()
      this.connection.remove(this.modelName!, this._id)
      if (fn) {
        fn(undefined, this)
      }
    }
    return new Promise<this>(res => res(this))
  }
  deleteOne(fn?: (err: any, product: this) => void): Promise<this> {
    if (!this.isDev) {
      return new Document().deleteOne.bind(this, fn)
    }
    return this.remove(fn)
  }

  modifiedPaths(): string[] {
    return new Document().modifiedPaths.bind(this)
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
      return new Document().update.bind(this, doc, options, callback)
      // return super.update(doc, options, callback)
    }
    this.ensureModelName()
    this.connection.update(this.modelName!, doc)
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
      // return super.updateOne(doc, options, callback)
      return new Document().updateOne.bind(this, doc, options, callback)
    }
    throw new Error('Method not implemented: updatedOne')
  }

  toJSON() {
    if (!this.isDev) {
      return new Document().toJSON.bind(this)
    }
    return this
  }

  toString() {
    if (!this.isDev) {
      return new Document().toString.bind(this)
    }
    return JSON.stringify(this)
  }

  async save(): Promise<this> {
    if (!this.isDev) {
      return new Document().save.bind(this)
    }

    this.ensureModelName()
    const data = this.connection.retrive()
    data[this.modelName!][this._id.toHexString()] =
      data[this.modelName!][this._id.toHexString()] || {}
    data[this.modelName!][this._id.toHexString()] = this

    this.connection.save(this.modelName!, data[this.modelName!])
    return new Promise<this>(res => res(this))
  }
}
