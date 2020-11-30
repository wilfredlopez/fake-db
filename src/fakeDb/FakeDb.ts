import { v4 } from 'uuid'
import { Connection } from './Connection'
import { DataInterface, DataWithId, WhereType } from './interfaces'

function isMatchFunction<T>(obj: T, where: WhereType<T>) {
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

const DATABSE_INTANCES: Record<string, FakeDb<any> | undefined> = {}

export class FakeDb<T extends {}> {
  private data: DataInterface<T>
  /**
   *
   * @param fileUrl JSON FILE URL.
   */
  private connection: Connection<DataInterface<T>>
  private name: string
  constructor(name: string) {
    this.name = name
    this.connection = new Connection<DataInterface<T>>()
    this.data = this.connection.retrive()
    let shouldInitialize = false
    if (Object.keys(this.data).length === 0) {
      shouldInitialize = true
    }
    if (!shouldInitialize) {
      if (this.data[this.name] === undefined) {
        shouldInitialize = true
      }
    }
    if (shouldInitialize) {
      this.data = {
        [name]: {},
      }
      this.save()
    }
    if (DATABSE_INTANCES[this.name]) {
      return DATABSE_INTANCES[this.name] as this
    } else {
      DATABSE_INTANCES[this.name] = this
    }
    return DATABSE_INTANCES[this.name] as this
  }

  get storedData() {
    return this.connection.retrive()[this.name]
  }

  getConnection() {
    return new Connection<DataInterface<T>>()
  }
  exists(where: WhereType<DataWithId<T>>, isMatch?: typeof isMatchFunction) {
    if (!isMatch) {
      isMatch = isMatchFunction
    }
    if (where._id) {
      return this.data[this.name][where._id] !== undefined
    } else {
      for (let obj of Object.values(this.data[this.name])) {
        if (isMatch(obj, where)) {
          return true
        }
      }
      return false
    }
  }

  filter(
    loopFunction?: (
      value: DataWithId<T>,
      index: number,
      array: DataWithId<T>[]
    ) => boolean
  ) {
    const data = Object.values(this.data[this.name])
    if (typeof loopFunction === 'function') {
      return data.filter(loopFunction)
    }
    return data
  }

  getAll() {
    const all: DataWithId<T>[] = []
    for (let key in this.data[this.name]) {
      const val = this.data[this.name][key]
      all.push(val)
    }
    return all
  }
  updateOne(updated: DataWithId<T>) {
    this.data[this.name][updated._id] = updated
    this.save()
    return this
  }
  update(updated: DataWithId<T>[]) {
    for (let obj of updated) {
      this.updateOne(obj)
    }
    return this
  }
  /**
   *
   * @param data object to save
   * @param shouldCreate [Optional] condition to determine if object already exists. if exists it will not be added again.
   */
  async create(
    data: T,
    shouldCreate?: (
      value: DataWithId<T>,
      index: number,
      obj: DataWithId<T>[]
    ) => void
  ) {
    if (typeof shouldCreate === 'function') {
      const existingData = Object.values(this.data[this.name])
      const exists = existingData.findIndex(shouldCreate)
      if (exists !== -1) {
        return existingData[exists]
      }
    }

    const id = v4()
    this.data[this.name][id] = {
      ...data,
      _id: id,
    }
    this.save()
    return this.data[this.name][id]
  }

  async createMany(data: T[]) {
    let created: Promise<DataWithId<T>>[] = []
    let current: Promise<DataWithId<T>>
    for (let obj of data) {
      current = this.create(obj)
      created.push(current)
    }
    const values = await Promise.all(created)
    return values
  }

  findById(id: DataWithId<T>['_id']) {
    return this.data[this.name][id]
  }

  clearDatabase() {
    this.data[this.name] = {}
    this.save()
    return this
  }

  removeById(id: DataWithId<T>['_id']) {
    const val = this.data[this.name][id]
    delete this.data[this.name][id]
    this.save()
    return val
  }

  remove(where: WhereType<DataWithId<T>>) {
    const obj = this.findOne(where)
    if (obj && typeof obj !== null) {
      return this.removeById(obj['_id'] as any)
    } else {
      return obj
    }
  }

  findOne(where: WhereType<DataWithId<T>>) {
    if (where._id) {
      return this.data[this.name][where._id]
    } else {
      for (let obj of Object.values(this.data[this.name])) {
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
            return obj
          }
        }
      }
      return null
    }
  }

  find(where: WhereType<DataWithId<T>>) {
    const result = []
    if (where._id) {
      result.push(this.data[this.name][where._id])
    } else {
      for (let obj of Object.values(this.data[this.name])) {
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
    return result
  }

  save() {
    this.connection.save(this.name, this.data[this.name])
    return this
  }
}
