import mongoose from "mongoose";
import { userModel as User } from "../auth/userModel";
import { mongooseAggregatePaginate } from "mongoose-aggregate-paginate-v2";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

categorySchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("Category", categorySchema);
