import fs from 'fs'
import { v4 } from 'uuid'

export type WhereType<T extends {}> = {
  [K in keyof T]?: T[K]
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
  data: DataInterface<T>
  /**
   *
   * @param fileUrl JSON FILE URL.
   */
  connection: Connection<DataInterface<T>>
  constructor(public fileUrl: string) {
    if (!fileUrl.endsWith('.json')) {
      throw new Error('File URL for FakeBb most end with .json')
    }
    this.connection = new Connection(fileUrl)
    this.data = this.connection.retrive()
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
  }
  create(data: T) {
    const id = v4()
    this.data[id] = {
      ...data,
      _id: id,
    }
    return this.data[id]
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
    const obj = this.find(where)
    if (obj && typeof obj !== null) {
      return this.removeById(obj['_id'] as any)
    } else {
      return obj
    }
  }

  find(where: WhereType<DataWithId<T>>) {
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

  save() {
    this.connection.save(this.data)
    return this
  }
}
