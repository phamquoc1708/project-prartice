import { TokenService } from "./../services/token.service";
import { TokenRepository } from "./../repository/token.repository";
import { UserRepository } from "./../repository/user.repository";
import { ValidationService } from "./../../helpers/validation.service";
import { UserService } from "./../services/user.service";
import { UserController } from "./../controllers/user.controller";
import { UserModel } from "../models/User.schema";
import express from "express";
import { checkAuth, asyncHandler } from "../../auth/checkAuth";
import { KeyTokenModel } from "../models/KeyToken.schema";

const router = express.Router();

const userRepository = new UserRepository(UserModel);
const tokenRepository = new TokenRepository(KeyTokenModel);
const tokenService = new TokenService();
const userServicer = new UserService(userRepository, tokenService);
const validationService = new ValidationService();
const userController = new UserController(userServicer, validationService);

router.post("/register", asyncHandler(userController.register()));
router.post("/verify-create-password-token", asyncHandler(userController.verifyCreatePasswordToken()));
router.post("/password", asyncHandler(userController.createPassword()));
router.post("/profile", asyncHandler(userController.updateInformation()));
router.post("/login", asyncHandler(userController.login()));

export default router;
