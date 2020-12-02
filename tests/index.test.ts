import { connectFakeDb, Connection, FakeDb } from '../src/index'
import path from 'path'

interface User {
  _id: string
  firstname: string
  lastname: string
  email: string
  password: string
}

const filePath = path.join(__dirname, 'test-user.json')

let userDbIntance: FakeDb<User>

const dbKey = 'testUsers'

describe.skip('fakeDb', () => {
  beforeAll(async () => {
    const connection = await connectFakeDb(filePath)
    if (connection && connection instanceof Connection) {
      connection.dropDatabase()
    }
  })

  it('can initialize itself', () => {
    const userDb = new FakeDb<User>(dbKey)
    userDbIntance = userDb
    expect(userDb).toBeDefined()
  })
  it('is a singleton', () => {
    const otherI = new FakeDb(dbKey)
    expect(userDbIntance).toBe(otherI)
  })
  it('finds all objects that meet criteria', () => {
    // const filePath = path.join(__dirname, 'test-user.json')
    const userDb = new FakeDb<User>('testUsers')
    // userDb.clearDatabase()
    userDb.create({
      _id: '1',
      email: 'test@test.com',
      firstname: 'wil',
      lastname: 'lopez',
      password: 'password',
    })
    userDb.create({
      _id: '2',
      email: 'test2@test.com',
      firstname: 'wil',
      lastname: 'some',
      password: 'password',
    })

    userDb.create({
      _id: '3',
      email: 'test3@test.com',
      firstname: 'wil',
      lastname: 'ddd',
      password: 'password',
    })

    userDb.create({
      _id: '3',
      email: 'test3@test.com',
      firstname: 'notwil',
      lastname: 'ddd',
      password: 'password',
    })

    userDb.save()

    const usersWithWillName = userDb.find({ firstname: 'wil' })
    expect(usersWithWillName.length).toBe(3)
  })

  it('filter the data', () => {
    // const filePath = path.join(__dirname, 'names.json')
    interface Names {
      first: string
      last: string
    }
    const namesDb = new FakeDb<Names>('namesDB')

    namesDb.create(
      {
        first: 'f1',
        last: 'l1',
      },
      obj => obj.first === 'f1'
    )
    namesDb.create(
      {
        first: 'f2',
        last: 'l2',
      },
      obj => obj.first === 'f2'
    )

    namesDb.save()
    const nameOfF1 = namesDb.filter(n => n.first === 'f1')
    expect(nameOfF1.length).toBe(1)
  })
})
