import mongoose from "mongoose";
import User from "../auth/userModel";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const addressSchema = new mongoose.Schema({
  addressLine1: {
    required: true,
    type: String,
  },
  addressLine2: { type: String },
  city: {
    required: true,
    type: String,
  },
  country: {
    required: true,
    type: String,
  },
  owner: {
    ref: "User",
    type: mongoose.SchemaTypes.ObjectId,
  },
  pincode: {
    required: true,
    type: String,
  },
  state: {
    required: true,
    type: String,
  },
});

addressSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("Address", addressSchema);
