import path from 'path'
import mongoose, { Mongoose } from 'mongoose'
import { MongooseDev } from '../src/index'
import { MoongooseDevConnection } from '../src/MongooseDev/MongooseConnection'

/**
 * TRIGGER DEV MODE TO RUN IN MONGODB DATABASE OR THE JSON FILE DATABASE (DEV MODE).
 * TO RUN IN PROD MAKE SURE MONGODB DATABASE IS RUNNING LOCALLY (docker-compose up -d)
 */
const DEV_MODE = true
const filePath = path.join(__dirname, 'mongoosedev.json')

//TESTS UTILS
class UserDocument extends MongooseDev.MongooseDevDocument<any> {
  firstname: string
  email: string
}

const userSchema = new mongoose.Schema<UserDocument>({
  firstname: String,
  email: String,
})
let User: MongooseDev.MongooseDevModel<UserDocument> //& { new (doc: Partial<UserDocument>): UserDocument}
// let User: MongooseDev.MongooseDevModel<UserDocument>

const DEMO_USER: Partial<UserDocument> & {
  email: string
  firstname: string
} = {
  email: 'test@email.com',
  firstname: 'Wilfred',
}
const LastEmail = 'mynewemail@email.com'

let conn: MoongooseDevConnection<any, any> | Mongoose | undefined = undefined

//Start tests
describe('Mongoose Dev', () => {
  beforeAll(async () => {
    conn = await MongooseDev.connectMongoIf({
      isDev: DEV_MODE,
      mongoUri: 'mongodb://127.0.0.1:27017',
      devJsonfilePath: filePath,
      options: {
        dbName: 'mongoosedev',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    })
    if (conn instanceof MoongooseDevConnection) {
      conn.dropDatabase()
    } else if (conn) {
      await conn.connection.dropDatabase()
    }

    User = new MongooseDev.MongooseDevModel(
      'User',
      userSchema,
      UserDocument,
      DEV_MODE
    ) as any
  })

  afterAll(async () => {
    if (conn instanceof MoongooseDevConnection) {
    } else if (conn) {
      await conn.disconnect()
    }
  })
  describe('Common operations', () => {
    it('creates model and saves it', async () => {
      const user = await User.create(DEMO_USER)
      DEMO_USER._id = user._id
      await user.save()
      const isSaved = await User.findOne({ _id: DEMO_USER._id })
      expect(String(isSaved!._id)).toBe(String(DEMO_USER._id))
      const withEmailFind = await User.findOne({ email: user.email })
      expect(withEmailFind!.email).toBe(user.email)
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
      expect(result!.save).toBeDefined()
      const byIdResult = await User.findOne({
        _id: result!._id,
      })
      const result2 = await User.findById(result!._id)
      expect(byIdResult!.firstname).toBe(DEMO_USER.firstname)
      expect(result2!.email).toBe(DEMO_USER.email)
    })
    it('UpdateOne: Updates Values in DB', async () => {
      const newName = 'NEW NAME'
      const result = await User.updateOne(
        {
          email: DEMO_USER.email,
        },
        {
          $set: {
            firstname: newName,
          },
        }
      )
      expect(result.nModified).toBe(1)
      const result2 = await User.findOne({ email: DEMO_USER.email })
      expect(result2!.firstname).toBe(newName)
      expect(result2!.email).toBe(DEMO_USER.email)
    })
    it('UpdateMany: Updates All Values in DB', async () => {
      const newName2 = 'NEW NAME 2'
      const testUser2 = await User.create({
        email: DEMO_USER.email,
        firstname: 'I DONT KNOW',
      })

      await testUser2.save()

      const result = await User.updateMany(
        {
          email: DEMO_USER.email,
        },
        {
          firstname: newName2,
        }
      )

      expect(result!.nModified).toBe(2)

      const result2 = await User.findOne({ email: DEMO_USER.email })
      expect(result2!.firstname).toBe(newName2)
      expect(result2!.email).toBe(DEMO_USER.email)
    })
    it('update: Updates only one document matching conditions', async () => {
      const testUser2 = await User.findOne({
        email: DEMO_USER.email,
      })

      const result = await User.update(
        {
          email: testUser2!.email,
        },
        {
          email: LastEmail,
        }
      )

      expect(result!.nModified).toBe(1)

      const result2 = await User.findOne({ email: LastEmail })
      expect(result2!.email).toBe(LastEmail)
    })

    it('removes from db', async () => {
      const demoUser = await User.findOne({ email: DEMO_USER.email })

      const res = await demoUser!.remove()
      expect(res._id).toBeDefined()
      const resNotIn = await User.findOne({ _id: demoUser!._id })
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

  describe('CREATE METHODS', () => {
    const CREATE_USER = {
      email: 'randomemail@test.com',
      firstname: 'Test Create',
    }

    it('creates calling create method on model and saves it to bd', async () => {
      const created = await User.create(CREATE_USER)
      expect(created.email).toBe(CREATE_USER.email)
      expect(created._id).toBeDefined()
      const isAutoSaved = await User.findOne({
        email: CREATE_USER.email,
      })

      expect(isAutoSaved?.email).toBe(CREATE_USER.email)
    })
    it('createRaw: new operator replacement', async () => {
      const u = User.createRaw({ email: 'ssss', firstname: 'soe' })
      expect(u._id).toBeDefined()
      const NotSaved = await User.findById(u._id)
      expect(NotSaved).toBe(null)
      await u.save()
      const saved = await User.findById(u._id)
      expect(String(saved?._id)).toBe(String(u._id))
    })
  })
  describe('extra methods clearDatabase, exists', () => {
    it('removes all (clearDatabase)', async () => {
      let users = await User.find({})
      expect(users.length).toBeGreaterThan(1)
      await User.clearDatabase()
      users = await User.find({})
      expect(users.length).toBe(0)
      // User.exists
    })
    it('returns true if exists (exists)', async () => {
      await User.create({
        email: 'notenemail@c.com',
        firstname: 'waheva',
      })
      let exists = await User.exists({
        email: DEMO_USER.email,
      })
      expect(exists).toBe(false)
      const created = await User.create({
        email: DEMO_USER.email,
        firstname: DEMO_USER.firstname,
      })
      expect(created._id).toBeDefined()
      exists = await User.exists({
        email: DEMO_USER.email,
      })
      expect(exists).toBe(true)
      // User.exists
    })
  })
})
