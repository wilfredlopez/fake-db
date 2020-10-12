## FakeDb

```ts
import FakeDb from 'fake-db'

interface User {
  _id: string
  firstname: string
  lastname: string
  email: string
  password: string
}
const userDb = new FakeDb<User>('users.json')

export default userDb
```

### Create

```ts
import userDb from './userdb'

const user = userDb.create({
  _id: '',
  email: 'email',
  firstname: 'name',
  lastname: 'last',
  password: 'pass',
})
userDb.save()
console.log(user)
```

### Find

```ts
import userDb from './userdb'
userDb.findById('1')
userDb.find({ email: 'useremail' })
```

### UPDATE

```ts
import userDb from './userdb'
const user1 = userDb.findById('1')
user1.firstname = 'other'

userDb.updateOne(user1)
```

### MORE

```ts
import userDb from './userdb'

userDb.getAll() // returns an array with all the values.
userDb.clearDatabase() // clears json file
```
