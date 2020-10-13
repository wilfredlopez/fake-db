import FakeDb from '../src/index'
import path from 'path'
import { existsSync } from 'fs'

interface User {
  _id: number
  firstname: string
  lastname: string
  email: string
  password: string
}

describe('fakeDb', () => {
  it('creates a db jsonfile', () => {
    const filePath = path.join(__dirname, 'test-user.json')
    new FakeDb<User>(filePath)
    expect(existsSync(filePath)).toBeTruthy()
  })

  it('finds all objects that meet criteria', () => {
    const filePath = path.join(__dirname, 'test-user.json')
    const userDb = new FakeDb<User>(filePath)
    userDb.clearDatabase()
    userDb.create({
      _id: 1,
      email: 'test@test.com',
      firstname: 'wil',
      lastname: 'lopez',
      password: 'password',
    })
    userDb.create({
      _id: 2,
      email: 'test2@test.com',
      firstname: 'wil',
      lastname: 'some',
      password: 'password',
    })

    userDb.create({
      _id: 3,
      email: 'test3@test.com',
      firstname: 'wil',
      lastname: 'ddd',
      password: 'password',
    })

    userDb.create({
      _id: 3,
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
    const filePath = path.join(__dirname, 'names.json')
    interface Names {
      first: string
      last: string
    }
    const namesDb = new FakeDb<Names>(filePath)

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
