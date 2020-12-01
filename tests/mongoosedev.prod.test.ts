import { MongooseDev } from '../src/index'
import mongoose, { Mongoose } from 'mongoose'
import path from 'path'
import { MoongooseDevConnection } from '../src/MongooseDev/MongooseConnection'

const filePath = path.join(__dirname, 'mongoosedev-prod.json')

class UserDocument extends MongooseDev.MongooseDevDocument<any> {
  fistname: string
  email: string
}

const userSchema = new mongoose.Schema<UserDocument>({
  fistname: String,
  email: String,
})
let User: MongooseDev.MongooseDevModel<UserDocument>

const DEMO_USER: Partial<UserDocument> & { email: string; fistname: string } = {
  email: 'test@email.com',
  fistname: 'Wilfred',
}
const LastEmail = 'mynewemail@email.com'

let conn: MoongooseDevConnection<any, any> | Mongoose | undefined = undefined
describe('MongooseDev in Production', () => {
  beforeAll(async () => {
    conn = await MongooseDev.connectMongoIf(
      true,
      'mongodb://127.0.0.1:27017',
      filePath,
      {
        dbName: 'mongoosedev',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    if (conn instanceof MoongooseDevConnection) {
      conn.dropDatabase()
    } else {
      await conn.connection.dropDatabase()
    }

    User = new MongooseDev.MongooseDevModel(
      'UserProd',
      userSchema,
      UserDocument,
      false
    )
  })

  afterAll(async () => {
    if (conn instanceof MoongooseDevConnection) {
    } else {
      await conn.disconnect()
    }
  })

  it('creates model and saves it', async () => {
    const user = await User.create(DEMO_USER)
    DEMO_USER._id = user._id
    await user.save()
    const isSaved = await User.findOne({ _id: DEMO_USER._id })
    expect(isSaved._id).toStrictEqual(DEMO_USER._id)
    const withEmailFind = await User.findOne({ email: user.email })
    expect(withEmailFind.email).toBe(user.email)
  })
  it('finds documents and returns it as array instance.', async () => {
    const allUsers = await User.find({})
    const user1 = allUsers[0]
    expect(user1.save).toBeDefined()
    expect(Array.isArray(allUsers)).toBeTruthy()
  })
  it('finds one and returns it as instance.', async () => {
    const result = await User.findOne({
      email: DEMO_USER.email,
    })
    expect(result.save).toBeDefined()
    const byIdResult = await User.findOne({
      _id: result._id,
    })
    const result2 = await User.findById(result._id)
    expect(byIdResult.fistname).toBe(DEMO_USER.fistname)
    expect(result2.email).toBe(DEMO_USER.email)
  })
  it('UpdateOne: Updates Values in DB', async () => {
    const newName = 'NEW NAME'
    await User.updateOne(
      {
        email: DEMO_USER.email,
      },
      {
        $set: {
          fistname: newName,
        },
      }
    )

    const result2 = await User.findOne({
      email: DEMO_USER.email,
    })
    expect(result2.fistname).toBe(newName)
    expect(result2.email).toBe(DEMO_USER.email)
  })
  it('UpdateMany: Updates All Values in DB', async () => {
    const newName2 = 'NEW NAME 2'
    const testUser2 = await User.create({
      email: DEMO_USER.email,
      fistname: 'I DONT KNOW',
    })

    const result = await User.updateMany(
      {
        email: testUser2.email,
      },
      {
        fistname: newName2,
      }
    )

    expect(result.nModified).toBe(2)

    const result2 = await User.findOne({ email: DEMO_USER.email })
    expect(result2.fistname).toBe(newName2)
    expect(result2.email).toBe(DEMO_USER.email)
  })
  it('update: Updates only one document matching conditions', async () => {
    const testUser2 = await User.findOne({
      email: DEMO_USER.email,
    })

    const result = await User.update(
      {
        email: testUser2.email,
      },
      {
        email: LastEmail,
      }
    )

    expect(result.nModified).toBe(1)

    const result2 = await User.findOne({ email: LastEmail })
    expect(result2.email).toBe(LastEmail)
  })

  it('removes from db', async () => {
    const demoUser = await User.findOne({ email: DEMO_USER.email })

    const res = await demoUser.remove()
    expect(res._id).toBeDefined()
    const resNotIn = await User.findOne({ _id: demoUser._id })
    expect(resNotIn).toBe(null)

    const removed = await User.deleteOne({
      email: LastEmail,
    })

    expect(removed.ok).toBeDefined()
    const isThere = await User.findOne({ email: LastEmail })
    expect(isThere).toBe(null)
    const removedSame = await User.deleteOne({
      email: LastEmail,
    })
    expect(removedSame.deletedCount).toBe(0)
  })
})
