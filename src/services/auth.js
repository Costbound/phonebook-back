import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { SessionsCollection } from '../db/models/session.js';
import { createSession } from '../utils/session.js';
import jwt from 'jsonwebtoken';
import { SMTP, TEMPLATES_DIR } from '../constants/index.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendEmail.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (user) throw createHttpError(409, 'Email in use');

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  return await UsersCollection.create({
    ...payload,
    password: hashedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (!user) throw createHttpError(401, 'User not found');

  const isPasswordEqual = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordEqual) throw createHttpError(401, 'Wrong password');

  await SessionsCollection.deleteOne({ userId: user._id });

  const newSession = createSession();

  const session = await SessionsCollection.create({
    session: { userId: user._id, ...newSession },
  });
  return {
    session,
    userData: {
      name: user.name,
      email: user.email,
    },
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) throw createHttpError(401, 'Session not found');

  const isRefreshTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isRefreshTokenExpired)
    throw createHttpError(401, 'Refresh token expired');

  const newSession = createSession();

  await SessionsCollection.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId, refreshToken) => {
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });
};

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found!');

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),
    {
      expiresIn: '5m',
    },
  );

  const templateSource = await fs.readFile(
    path.join(TEMPLATES_DIR, 'reset-password-email.html'),
    'utf8',
  );
  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    action_url: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: env(SMTP.FROM),
    to: email,
    subject: 'Reset password',
    html,
  });
};

export const resetPassword = async (payload) => {
  let userData;

  try {
    userData = jwt.verify(payload.token, env('JWT_SECRET'));
  } catch (err) {
    console.log(err.message);
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await UsersCollection.findOne({
    email: userData.email,
    _id: userData.sub,
  });

  if (!user) throw createHttpError(404, 'User not found');

  const isNewPasswordEqualOld = await bcrypt.compare(
    payload.password,
    user.password,
  );
  if (isNewPasswordEqualOld)
    throw createHttpError(
      401,
      'New password must be different from the old password',
    );

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  const updatedUser = await UsersCollection.findOneAndUpdate(
    { _id: user._id },
    { password: encryptedPassword },
    { new: true },
  );

  if (!updatedUser) throw createHttpError(500, 'Fail to update password');

  await SessionsCollection.deleteOne({ userId: user._id });

  return updatedUser;
};
