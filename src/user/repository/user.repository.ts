import { PaginateModel } from "mongoose";
import { AbstractRepository } from "../../common/repository";
import { UserDoc } from "../models/User.schema";

export class UserRepository extends AbstractRepository<UserDoc> {
  constructor(public model: PaginateModel<UserDoc>) {
    super(model);
  }
}
