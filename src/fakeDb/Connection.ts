import fs from 'fs'
import { DataInterface } from './interfaces'

export interface Connection<T extends DataInterface<{}>> {
  retrive: () => T
  save: (instanceName: keyof T, obj: T[string]) => this
  dropDatabase: () => void
}

export class FakeDbConnectionError extends Error {
  constructor() {
    super(
      'Connection: Please me sure connection is established by calling the connect function.'
    )
    this.name = 'FakeDbConnectionError'
  }
}

export const Connection: {
  new <T extends DataInterface<{}>>(fileUrl?: string): Connection<T>
} = (() => {
  let Instance: Connection<any>
  class Connection<T extends DataInterface<{}>> {
    /**
     *
     * @param fileUrl JSON FILE URL.
     */
    #fileUrl?: string
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
    public save(instanceName: keyof T, obj: T[string]) {
      if (!this.#fileUrl) {
        throw new FakeDbConnectionError()
      }
      const allData = this.retrive()
      allData[instanceName] = obj
      const data = JSON.stringify(allData)
      fs.writeFileSync(this.#fileUrl, data)
      return this
    }
  }
  return Connection
})()

// class Connection<T extends {}> {
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
//   public save(obj: T) {
//     const data = JSON.stringify(obj)
//     fs.writeFileSync(this.fileUrl, data)
//     return this
//   }
// }
