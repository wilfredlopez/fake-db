export type WhereType<T extends {}> = {
  [K in keyof T]?: T[K]
}
