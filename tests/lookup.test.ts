import { isQueryString } from '../src/MongooseDev'

describe('lookup', () => {
  it('shold work', () => {
    const o = {
      $set: {
        name: 'ME',
      },
    }

    const value = isQueryString({
      $set: {
        email: 'Email2',
      },
      email: 'blank',
    })

    expect(value).toBe('$set')
    const isNot = isQueryString({
      email: 'blank',
    })

    expect(isNot).toBeUndefined()
  })
})
