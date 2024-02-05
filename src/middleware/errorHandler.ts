import express from 'express'

export const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void => {
  const error = {
    status: 'error',
    message: err.message,
  }

  res.status(500).json(error)
}
