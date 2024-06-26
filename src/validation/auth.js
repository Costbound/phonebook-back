import Joi from 'joi';

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(25).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});

export const requestResetTokenSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required(),
});
