import Ajv, { ErrorObject, JSONSchemaType, ValidationError } from "ajv";
import ajvFormats from "ajv-formats";

export class ValidationService {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ coerceTypes: true, removeAdditional: "all" });
    ajvFormats(this.ajv, { mode: "full" });
    this.ajv.addKeyword({
      keyword: "isNotEmpty",
      type: "string",
      validate: (schema: any, data: any) => {
        return typeof data === "string" && data.trim() !== "";
      },
      error: {
        message: "Must not be empty",
      },
    });
  }

  validate<T>(schema: JSONSchemaType<T>, data: any) {
    const validate = this.ajv.compile(schema);
    if (this.ajv.validate(schema, data)) {
      return data as T;
    } else {
      throw new ValidationError(validate.errors as Partial<ErrorObject>[]);
    }
  }
}
