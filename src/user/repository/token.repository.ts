import { TokenDoc } from "./../models/KeyToken.schema";
import { PaginateModel } from "mongoose";
import { AbstractRepository } from "../../common/repository";

export class TokenRepository extends AbstractRepository<TokenDoc> {
  constructor(public model: PaginateModel<TokenDoc>) {
    super(model);
  }
}
