import fs from 'fs'
import { DataInterface } from './interfaces'
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
  T extends DataInterface<D>
> {
  /**
   *
   * @param fileUrl JSON FILE URL.
   */
  #fileUrl?: string
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
  public retrive() {
    const url = this.#assertFileUrl()
    // if (!this.#fileUrl) {
    //   throw new FakeDbConnectionError()
    // }
    const data = fs.readFileSync(url, {
      encoding: 'utf-8',
      flag: 'a+',
    })
    if (data) {
      return JSON.parse(data) as T
    }
    return {} as T
  }

  public dropDatabase() {
    const url = this.#assertFileUrl()
    const data = this.retrive() || {}
    for (let key in data) {
      for (let innerKey in data[key]) {
        delete data[key][innerKey]
      }
    }
    fs.writeFileSync(url, JSON.stringify(data))
  }
  remove(instanceName: keyof T, id: ObjectID) {
    const allData = this.retrive()
    delete allData[instanceName][id.toHexString()]
    const data = JSON.stringify(allData)
    fs.writeFileSync(this.#assertFileUrl(), data)
    return this
  }

  update(instanceName: string, obj: MongooseDevDocument<D>) {
    const allData = this.retrive()
    allData[instanceName][obj._id.toHexString()] = obj
    const data = JSON.stringify(allData)
    fs.writeFileSync(this.#assertFileUrl(), data)
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
    //{otherinstance: {}, instanceName: obj}

    // allData[instanceName] = obj //alternative but leads to {"instanceName": {"instanceName": obj}}

    const data = JSON.stringify(allData)

    fs.writeFileSync(this.#fileUrl, data)
    return this
  }
  public save(instanceName: keyof T, obj: T[string]) {
    if (!this.#fileUrl) {
      throw new MongooseDevConnectionError()
    }
    const allData = this.retrive()
    allData[instanceName] = allData[instanceName] || {}
    allData[instanceName] = obj
    const data = JSON.stringify(allData)
    fs.writeFileSync(this.#fileUrl, data)
    return this
  }
}
