import { MongooseDev } from '../src/index'
import mongoose from 'mongoose'
import path from 'path'
import { MoongooseDevConnection } from '../src/MongooseDev/MongooseConnection'

const filePath = path.join(__dirname, 'mongoosedev.json')

class UserDocument extends MongooseDev.MongooseDevDocument<any> {
  fistname: string
  email: string
}

const userSchema = new mongoose.Schema<UserDocument>({
  fistname: String,
  email: String,
})

describe('Mongoose Dev', () => {
  beforeAll(async () => {
    const conn = await MongooseDev.connectMongoIf(
      false,
      'mongodb:2555///',
      filePath,
      {}
    )
    if (conn instanceof MoongooseDevConnection) {
      conn.dropDatabase()
    }
  })

  it('creates model', async () => {
    const User = new MongooseDev.MongooseDevModel(
      'User',
      userSchema,
      UserDocument
    )
    const user = await User.create({
      email: 'test@email.com',
      fistname: 'Wilfred',
    })
    await user.save()
    const isSaved = await User.findOne({ _id: user._id })
    expect(isSaved._id).toBe(user._id)
    const withEmailFind = await User.findOne({ email: user.email })
    expect(withEmailFind.email).toBe(user.email)
  })
})
