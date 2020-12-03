export type WithStringId<T extends {}> = T & { _id: string }

export type FakeDbData<T> = Record<string, Record<string, WithStringId<T>>>
