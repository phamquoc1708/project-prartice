import { StatusCodes } from "http-status-codes";
import { ValidationService } from "./../../helpers/validation.service";
import { JSONSchemaType } from "ajv";
import { IUserService } from "./../services/user.service";
import { HandleFunc } from "./../../controller";
import { RegisterInput, VerifyTokenInput, CreatePasswordInput, UpdateInformationInput } from "../types/user.type";

export class UserController {
  constructor(private userService: IUserService, private validation: ValidationService) {}

  register(): HandleFunc {
    const schema: JSONSchemaType<RegisterInput> = {
      type: "object",
      properties: {
        email: {
          type: "string",
          format: "email",
          maxLength: 50,
        },
      },
      required: ["email"],
    };
    return async (req, res, next) => {
      const payload = this.validation.validate(schema, req.body);
      const result = await this.userService.register(payload);
      res.status(StatusCodes.CREATED).json({ result });
    };
  }

  testAuth(): HandleFunc {
    return async (req, res, next) => {
      res.status(StatusCodes.CREATED).json({ mess: "Success" });
    };
  }

  verifyCreatePasswordToken(): HandleFunc {
    const schema: JSONSchemaType<VerifyTokenInput> = {
      type: "object",
      properties: {
        token: {
          type: "string",
        },
      },
      required: ["token"],
    };
    return async (req, res, next) => {
      const payload = this.validation.validate(schema, req.body);
      await this.userService.verifyCreatePasswordToken(payload.token);
      res.status(StatusCodes.OK).json({});
    };
  }

  createPassword(): HandleFunc {
    const schema: JSONSchemaType<CreatePasswordInput> = {
      type: "object",
      properties: {
        token: {
          type: "string",
        },
        password: {
          type: "string",
        },
      },
      required: ["token", "password"],
    };
    return async (req, res, next) => {
      const payload = this.validation.validate(schema, req.body);
      await this.userService.createPassword(payload);
      res.status(StatusCodes.CREATED);
    };
  }

  updateInformation(): HandleFunc {
    const schema: JSONSchemaType<UpdateInformationInput> = {
      type: "object",
      properties: {
        fullName: {
          type: "string",
        },
        mobile: {
          type: "string",
        },
        title: {
          type: "string",
        },
        memo: {
          type: "string",
        },
      },
      required: ["fullName", "mobile", "title"],
    };
    return async (req, res, next) => {
      const payload = this.validation.validate(schema, req.body);
      await this.userService.updateUser(payload);
      res.status(StatusCodes.OK);
    };
  }
}