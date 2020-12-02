import { FakeDb } from '../src/index'

interface User {
  _id: string
  firstname: string
  lastname: string
  email: string
  password: string
}

describe.skip('fakeDb', () => {
  it('throws error if connection not initialized first', () => {
    expect(() => new FakeDb<User>('testUsers')).toThrow()
  })
})
