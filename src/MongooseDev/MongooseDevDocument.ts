import { EventEmitter } from 'events'
import { ObjectID } from 'mongodb'
import mongoose, { Document } from 'mongoose'
import { DataInterface } from './interfaces'
import { MoongooseDevConnection } from './MongooseConnection'
import { getInstance, MongooseDevModel } from './MongooseDevModel'

type PropertiesOf<T extends {}> = {
  [P in keyof T]: T[P]
}

export type DevDocumentContructor<T extends { _id: ObjectID }> = {
  // isDev: boolean
  modelName?: string
} & PropertiesOf<T>

//Defines all properties that should not be enumerable
function defineNotEnumerableProperties(
  obj: MongooseDevDocument<any>,
  modelName: string
) {
  Object.defineProperty(obj, 'modelName', {
    enumerable: false,
    value: modelName || '',
  })
  Object.defineProperty(obj, '_events', {
    enumerable: false,
  })
  Object.defineProperty(obj, '_eventsCount', {
    enumerable: false,
  })
}

export class MongooseDevDocument<T extends { _id: ObjectID }>
  extends EventEmitter
  implements Document {
  _id: ObjectID
  errors: any
  isNew: boolean
  schema: mongoose.Schema<any>
  $locals: { [k: string]: any }
  collection: mongoose.Collection
  db: mongoose.Connection
  __v?: number | undefined

  /* ------****************************------
   *        Custom Properties and Methods
   * ------***************************------*/

  private modelName?: string
  get id() {
    return this._id.toHexString()
  }
  protected get connection() {
    return new MoongooseDevConnection<T, DataInterface<T>>()
  }

  private get isDev() {
    return this.modelInstance.isDev
  }
  // private isDev = true

  protected get modelInstance(): MongooseDevModel<this> {
    return getInstance<this>(this.modelName!)!
  }

  /* ------****************************------
   *        Constructor
   * ------***************************------*/
  constructor(props: DevDocumentContructor<T>) {
    super()
    const { modelName, _id, ...rest } = props
    this.modelName = modelName || ''
    this._id = new ObjectID(_id)
    // if (_id) {
    // }

    defineNotEnumerableProperties(this, modelName || '')
    //Protected Property can only be set from within the class.
    Object.defineProperty(this, 'connection', {
      enumerable: false,
      value: this.connection,
    })

    //Defining all properties of the object constructor values
    //eg: new User({_id:"1", isDev:true, modelName:"User", email:'ss', password:'asdsad'})
    for (let [key, value] of Object.entries(rest)) {
      Object.defineProperty(this, key, {
        enumerable: true,
        value: value,
      })
    }
  }

  private ensureModelName() {
    if (!this.modelName) {
      throw new Error('modelName was not provided')
    }
  }

  /* ------****************************------
   *        Mongoose Document Methods
   * ------***************************------*/

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

  async remove(fn?: (err: any, product: this) => void): Promise<this> {
    if (!this.isDev) {
      return new Document().remove.bind(this, fn)
    }
    return new Promise<this>(async res => {
      this.ensureModelName()
      const response = this
      await this.modelInstance.deleteOne({ _id: this._id })
      // this.connection.remove(this.modelName!, this._id)
      if (fn) {
        fn(undefined, response)
      }
      res(response)
    })
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
    return {
      ...this,
      id: this.id,
    }
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
    if (!data[this.modelName!]) {
      data[this.modelName!] = {}
    }
    data[this.modelName!][this._id.toHexString()] =
      data[this.modelName!][this._id.toHexString()] || {}
    data[this.modelName!][this._id.toHexString()] = this

    this.connection.save(this.modelName!, data[this.modelName!])
    return new Promise<this>(res => res(this))
  }
}
