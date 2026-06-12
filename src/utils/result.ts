export type ErrorResult<Err extends Error = Error> = { data: null, error: Err }

export type DataResult<T> = { data: T, error: null }

export type ResultType<T, Err extends Error = Error> = DataResult<T> | ErrorResult<Err>


export function createDataResult<T> (data: T): DataResult<T> {
  return { data, error: null }
}

export function createErrorResult<Err extends Error = Error> (error: Err): ErrorResult<Err> {
  return { data: null, error }
}
