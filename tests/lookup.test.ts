import { isQueryString } from '../src/MongooseDev/utils'

describe.skip('lookup', () => {
  it('shold work', () => {
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
