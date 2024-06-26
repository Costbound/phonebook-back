import { HttpError } from 'http-errors';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    const responseData = {
      status: err.status,
      message: err.name,
      data: { message: err.message },
    };
    if (err.errors) {
      responseData.data.errors = err.errors;
    }
    res.status(err.status).json(responseData);
    return;
  }
  res.status(500).json({
    satus: 500,
    message: 'Something went wrong',
    data: err.message,
  });
};
