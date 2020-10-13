## FakeDb

```ts
import FakeDb from '@wilfredlopez/fake-db'

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
userDb.findOne({ email: 'useremail' }) // returns the first element that match or null.
const usersCalledName = userDb.find({ firstname: 'name' }) // returns an array with all elements that match.
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
const nameOfF1 = userDb.filter(u => u.firstname === 'f1') // returns an array of all elements that match the filter function.
```
