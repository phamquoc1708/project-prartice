import { StatusCodes } from "http-status-codes";
import { Document, PaginateModel, PaginateResult } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { AppError } from "../../utils/error";

export abstract class AbstractRepository<T> {
  public model: PaginateModel<T>;
  constructor(model: PaginateModel<T>) {
    this.model = model;
  }

  findOne(condition: object, projection?: any, options?: object, populates?: any) {
    return this.model.findOne(condition, projection, options).populate(populates).exec();
  }

  findMany(conditions: object, projection?: any, options?: object, populates?: any): Promise<T[]> {
    return this.model.find(conditions, projection, options).populate(populates).exec();
  }

  paginate(conditions: object, options: object): Promise<PaginateResult<T>> {
    return this.model.paginate(conditions, options);
  }

  async firstOrFail(conditions: object, projection?: any, options?: object, populates?: any, error?: any) {
    const data = await this.findOne(conditions, projection, options, populates);
    if (!data) {
      if (!error) {
        error = {
          error: "NOT_FOUND",
          message: "Not Found",
          statusCode: StatusCodes.NOT_FOUND,
          httpStatus: StatusCodes.NOT_FOUND,
        };
      }
      throw new AppError(error, "NOT_FOUND");
    }
    return data;
  }

  async create(payload: object, options?: object): Promise<T> {
    const instance = new this.model(payload);
    await instance.save(options);
    return instance;
  }

  async update(conditions: object, payload: object, options?: object) {
    return await this.model.updateOne(conditions, payload, options);
  }

  findOneAndUpdate(conditions: object, payload: object, options?: object) {
    return this.model.findOneAndUpdate(conditions, payload, options).exec();
  }

  updateMany(conditions: object, payload: object, options?: object) {
    return this.model
      .updateMany(conditions, payload, {
        new: true,
        ...options,
      })
      .exec();
  }

  removeOne(conditions: object, options?: object) {
    return this.model.findOneAndRemove(conditions, options).exec();
  }

  removeMany(conditions: object, options?: object) {
    return this.model.deleteMany(conditions, options).exec();
  }
}
