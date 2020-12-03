import fs from 'fs'
import { FakeDbData } from './interfaces'

export interface FakeDbConnection<T extends FakeDbData<{}>> {
  retrive: () => T
  save: (instanceName: keyof T, obj: T[string]) => this
  dropDatabase: () => void
}

export class FakeDbConnectionError extends Error {
  constructor() {
    super(
      'FakeDbConnection: Please me sure connection is established by calling the connect function.'
    )
    this.name = 'FakeDbConnectionError'
  }
}

export const FakeDbConnection: {
  new <T extends FakeDbData<{}>>(fileUrl?: string): FakeDbConnection<T>
} = (() => {
  let Instance: FakeDbConnection<any>
  class FakeDbConnection<T extends FakeDbData<{}>> {
    /**
     *
     * @param fileUrl JSON FILE URL.
     */
    #fileUrl?: string
    #cache: T | undefined

    private writeFile(allData: T) {
      this.#cache = allData
      const data = JSON.stringify(allData)
      fs.writeFileSync(this.#assertFileUrl(), data)
    }

    #assertFileUrl = () => {
      if (!this.#fileUrl) {
        throw new FakeDbConnectionError()
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
        throw new FakeDbConnectionError()
      }

      if (Instance) {
        return Instance
      } else {
        Instance = this
      }
      return Instance
    }
    public retrive(force = false) {
      if (this.#cache && Object.keys(this.#cache).length !== 0 && !force) {
        return this.#cache
      }
      const url = this.#assertFileUrl()
      const data = fs.readFileSync(url, {
        encoding: 'utf-8',
        flag: 'a+',
      })
      if (data) {
        this.#cache = JSON.parse(data) as T
      } else {
        this.#cache = {} as T
      }
      return { ...this.#cache }
    }
    remove(instanceName: keyof T, id: string) {
      const allData = this.retrive()
      delete allData[instanceName][id]
      this.writeFile(allData)
      return this
    }
    update(instanceName: string, obj: T[string][string]) {
      const allData = this.retrive()
      allData[instanceName][obj._id] = obj
      this.writeFile(allData)
      return this
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
    public save(instanceName: keyof T, obj: T[string]) {
      if (!this.#fileUrl) {
        throw new FakeDbConnectionError()
      }
      const allData = this.retrive() || {}
      allData[instanceName] = obj
      this.writeFile(allData)
      return this
    }
  }
  return FakeDbConnection
})()
