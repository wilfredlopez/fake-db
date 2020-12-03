import { FakeDbConnection } from './FakeDbConnection'

export function connectFakeDb(uris: string): Promise<FakeDbConnection<any>> {
  return new Promise(res => {
    const connection = new FakeDbConnection(uris)
    res(connection)
  })
}
