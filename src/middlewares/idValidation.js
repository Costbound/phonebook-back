import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';

export const isValidContactId = (req, res, next) => {
  isValidObjectId(req.params.contactId)
    ? next()
    : next(createHttpError(404, 'Contact not found'));
};
