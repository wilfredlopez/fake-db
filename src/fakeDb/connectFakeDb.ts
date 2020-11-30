import { Connection } from './Connection'

export function connectFakeDb(uris: string): Promise<Connection<any>> {
  return new Promise(res => {
    const connection = new Connection(uris)
    res(connection)
  })
}
