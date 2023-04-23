import { ValidationService } from "./../../helpers/validation.service";
import { UserService } from "./../services/user.service";
import { UserController } from "./../controllers/user.controller";
import { UserModel } from "../models/User.schema";
import express from "express";
import { checkAuth, asyncHandler } from "../../auth/checkAuth";

const router = express.Router();

const userServicer = new UserService();
const validationService = new ValidationService();
const userController = new UserController(userServicer, validationService);

router.post("/register", asyncHandler(userController.register()));
router.get("/test", checkAuth, asyncHandler(userController.testAuth()));
router.post("/verify-create-password-token", asyncHandler(userController.verifyCreatePasswordToken));
router.post("/password", asyncHandler(userController.createPassword));

export default router;
