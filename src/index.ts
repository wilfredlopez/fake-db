import fs from 'fs'
import { v4 } from 'uuid'

export type WhereType<T extends {}> = {
  [K in keyof T]?: T[K]
}

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

class Connection<T extends {}> {
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
  public save(obj: T) {
    const data = JSON.stringify(obj)
    fs.writeFileSync(this.fileUrl, data)
    return this
  }
}

export type DataWithId<T extends {}> = T & { _id: string }

type DataInterface<T> = { [key: string]: DataWithId<T> }

export default class FakeDb<T extends {}> {
  private data: DataInterface<T>
  /**
   *
   * @param fileUrl JSON FILE URL.
   */
  private connection: Connection<DataInterface<T>>
  constructor(public fileUrl: string) {
    if (!fileUrl.endsWith('.json')) {
      throw new Error('File URL for FakeBb most end with .json')
    }
    this.connection = new Connection(fileUrl)
    this.data = this.connection.retrive()
  }

  exists(where: WhereType<DataWithId<T>>, isMatch?: typeof isMatchFunction) {
    if (!isMatch) {
      isMatch = isMatchFunction
    }
    if (where._id) {
      return this.data[where._id] !== undefined
    } else {
      for (let obj of Object.values(this.data)) {
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
    const data = Object.values(this.data)
    if (typeof loopFunction === 'function') {
      return data.filter(loopFunction)
    }
    return data
  }

  getAll() {
    const all: DataWithId<T>[] = []
    for (let key in this.data) {
      const val = this.data[key]
      all.push(val)
    }
    return all
  }
  updateOne(updated: DataWithId<T>) {
    this.data[updated._id] = updated
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
      const data = Object.values(this.data)
      const exists = data.findIndex(shouldCreate)

      if (exists !== -1) {
        return data[exists]
      }
    }

    const id = v4()
    this.data[id] = {
      ...data,
      _id: id,
    }
    return this.data[id]
  }

  createMany(data: T[]) {
    let created = []
    let current
    for (let obj of data) {
      current = this.create(obj)
      created.push(current)
    }
    return created
  }

  findById(id: DataWithId<T>['_id']) {
    return this.data[id]
  }

  clearDatabase() {
    this.data = {}
    this.save()
    return this
  }

  removeById(id: DataWithId<T>['_id']) {
    const val = this.data[id]
    delete this.data[id]
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
      return this.data[where._id]
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
      result.push(this.data[where._id])
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
    return result
  }

  save() {
    this.connection.save(this.data)
    return this
  }
}
