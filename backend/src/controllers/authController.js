const authService = require('../services/authService');
const passwordResetService = require('../services/passwordResetService');

async function register(req, res, next) {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await passwordResetService.requestReset(req.body.email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await passwordResetService.resetPassword(
      req.body.token,
      req.body.password
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
