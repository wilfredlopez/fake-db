import mongoose, {
  CreateQuery,
  FilterQuery,
  Query,
  Schema,
  UpdateQuery,
} from 'mongoose'
import { MoongooseDevConnection } from '.'
import { DataInterface, DocumentType } from './interfaces'
import { MongooseDevModelMixin } from './MongooseDevModelMixin'

const MODEL_INSTANCES: Record<string, MongooseDevModel<any>> = {}

export interface MongooseDevModel<T extends DocumentType>
  extends mongoose.Model<T> {
  new (doc: Partial<T>): T
  createRaw(doc: Partial<T>): T
  clearDatabase(): void
  isDev: boolean
  deleteOne<T extends DocumentType>(
    where: FilterQuery<T>
  ): Query<
    { ok?: number | undefined; n?: number | undefined } & {
      deletedCount?: number | undefined
    }
  >
  MemoryData: Record<string, Record<string, DocumentType>>
  refetch: boolean
  modelName: string
  schema: Schema<any>
  baseClass: new (...props: any[]) => any

  readonly connection: MoongooseDevConnection<
    DocumentType,
    DataInterface<DocumentType>
  >

  createRaw<T extends DocumentType>(doc: Partial<T>): T

  createInstance<T extends DocumentType>(data: Partial<T> | CreateQuery<T>): T
  createInstanceArray<T extends DocumentType>(dataArray: T[]): T[]

  _data: Record<string, any>

  findOneDev(where: FilterQuery<T>): T | null

  getTransformedConditions<T extends DocumentType>(
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>
  ): any

  save(): Promise<this>
}

export function getInstance<T extends DocumentType>(modelname: string) {
  if (MODEL_INSTANCES[modelname]) {
    return MODEL_INSTANCES[modelname] as MongooseDevModel<T>
  }
  return null
}

//@ts-ignore
export const MongooseDevModel: {
  new <T extends DocumentType>(
    modelName: string,
    schema: Schema<T>,
    baseClass: new (doc: Partial<T>) => T,
    isDev?: boolean
  ): MongooseDevModel<T>
} = (function () {
  function MongooseDevModel<T extends DocumentType>(
    modelName: string,
    schema: Schema<T>,
    baseClass: new (doc: Partial<T>) => T,
    isDev = true
  ) {
    if (MODEL_INSTANCES[modelName]) {
      return MODEL_INSTANCES[modelName] as any // as MongooseDevModel<T> // & (new () => MongooseDevModel<T>)
    }
    const Mix = MongooseDevModelMixin(baseClass)

    Mix.isDev = isDev
    Mix.model = mongoose.model<T>(modelName, schema)
    Mix.modelName = modelName
    Mix.baseClass = baseClass
    Mix.prototype.constructor = baseClass.prototype.constructor

    MODEL_INSTANCES[modelName] = Mix as any

    return MODEL_INSTANCES[modelName] as any // as MongooseDevModel<T> //& (new () => MongooseDevModel<T>)
  }
  return MongooseDevModel
})()
