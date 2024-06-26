import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    next(createHttpError(401, 'Authorization header is not provided'));
    return;
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    next(createHttpError(401, 'Authorization header must a type of Bearer'));
    return;
  }

  const session = await SessionsCollection.findOne({ accessToken: token });

  if (!session) {
    next(createHttpError(401, 'Session not found'));
    return;
  }

  const isExpiredAccesToken =
    new Date() > new Date(session.accessTokenValidUntil);
  if (isExpiredAccesToken) {
    next(createHttpError(401, 'Acces token expired'));
    return;
  }

  const user = await UsersCollection.findOne({ _id: session.userId });

  if (!user) {
    next(createHttpError(401, 'Any user linked to this session'));
    return;
  }

  req.user = user;

  next();
};
