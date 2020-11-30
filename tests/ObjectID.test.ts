import { ObjectID } from 'mongodb'

describe('ObjectID', () => {
  it('Returns the same string when converted to hexString', () => {
    const id = new ObjectID()
    expect(String(id)).toBe(id.toHexString())
  })
  it('Returns the same string from Date when converted to hexString', () => {
    const id = ObjectID.createFromTime(new Date().getTime())
    expect(String(id)).toBe(id.toHexString())
  })
  it('creates and id from existing string', () => {
    const id = new ObjectID('4329ee8a0000000000000000')
    expect(String(id)).toBe('4329ee8a0000000000000000')
  })
  it('is doesnt throw an error', () => {
    const [one, two, ...rest] = [1, 2]
    for (let [] of Object.entries(rest)) {
      // console.log('entries')
    }
  })
})
