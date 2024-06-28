import {
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
  resetPassword,
} from '../services/auth.js';
import { setupSession } from '../utils/session.js';
import { requestResetToken } from '../services/auth.js';

export const registerUserController = async (req, res) => {
  const userData = await registerUser(req.body);
  const loginResponse = await loginUser(userData);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      user: loginResponse.userData,
      token: loginResponse.session.accessToken,
    },
  });
};

export const loginUserController = async (req, res) => {
  const loginResponse = await loginUser(req.body);

  setupSession(res, loginResponse.session);

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      user: loginResponse.userData,
      token: loginResponse.session.accessToken,
    },
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUsesController = async (req, res) => {
  const { sessionId: sessionIdCookie, refreshToken: refreshTokenCookie } =
    req.cookies;

  if (sessionIdCookie && refreshTokenCookie) {
    await logoutUser(sessionIdCookie, refreshTokenCookie);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    status: 200,
    message: 'Reset password email was successfully sent.',
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
