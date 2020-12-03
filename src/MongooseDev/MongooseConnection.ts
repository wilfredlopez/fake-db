import fs from 'fs'
import { MongooseDevData } from './interfaces'
import { ObjectID } from 'mongodb'
import { MongooseDevDocument } from './MongooseDevDocument'

export class MongooseDevConnectionError extends Error {
  constructor() {
    super(
      'Please me sure connection is established by calling the connect function.'
    )
    this.name = 'FakeDbConnectionError'
  }
}
let Instance: MoongooseDevConnection<any, any>

export class MoongooseDevConnection<
  D extends { _id: ObjectID },
  T extends MongooseDevData<D>
> {
  /**
   *
   * @param fileUrl JSON FILE URL.
   */
  #fileUrl?: string
  private cache: T | undefined
  #assertFileUrl = () => {
    if (!this.#fileUrl) {
      throw new MongooseDevConnectionError()
    }
    return this.#fileUrl
  }
  constructor(fileUrl?: string) {
    this.#fileUrl = fileUrl
    if (Instance) {
      return Instance
    }
    if (fileUrl && !fileUrl.endsWith('.json')) {
      throw new Error('File URL for FakeBb most end with .json')
    }
    if (!fileUrl) {
      throw new MongooseDevConnectionError()
    }

    if (Instance) {
      return Instance
    } else {
      Instance = this
    }
    return Instance
  }
  public retrive(force = false) {
    if (this.cache && Object.keys(this.cache).length !== 0 && !force) {
      return this.cache
    }
    const url = this.#assertFileUrl()
    const data = fs.readFileSync(url, {
      encoding: 'utf-8',
      flag: 'a+',
    })
    if (data) {
      this.cache = JSON.parse(data) as T
    } else {
      this.cache = {} as T
    }
    return { ...this.cache }
  }

  public dropDatabase() {
    const data = this.retrive() || {}
    for (let key in data) {
      for (let innerKey in data[key]) {
        delete data[key][innerKey]
      }
    }
    this.writeFile(data)
  }
  remove(instanceName: keyof T, id: ObjectID) {
    const allData = this.retrive()
    delete allData[instanceName][id.toHexString()]
    this.writeFile(allData)
    return this
  }

  private writeFile(allData: T) {
    this.cache = allData
    const data = JSON.stringify(allData)
    fs.writeFileSync(this.#assertFileUrl(), data)
  }

  update(instanceName: string, obj: MongooseDevDocument<D>) {
    const allData = this.retrive()
    allData[instanceName][obj._id.toHexString()] = obj
    this.writeFile(allData)
    return this
  }

  public saveFull(instanceName: keyof T, obj: T) {
    if (!this.#fileUrl) {
      throw new MongooseDevConnectionError()
    }
    //{otherinstance: {}, instanceName: {}}
    //{otherinstance: {}, undefined}
    let allData = this.retrive() || {}
    allData[instanceName] = allData[instanceName] || {}
    //{otherinstance: {}, instanceName: {}}
    Object.assign(allData, obj)
    this.writeFile(allData)
    return this
  }
  public save(instanceName: keyof T, obj: T[string]) {
    //Obj should be the full database for the instanceName
    //obj = {'intanceName': {'id1': typeof D, 'id2': typeof D}}
    if (!this.#fileUrl) {
      throw new MongooseDevConnectionError()
    }
    const allData = this.retrive()
    allData[instanceName] = allData[instanceName] || {}
    allData[instanceName] = obj
    this.writeFile(allData)
    return this
  }
}
