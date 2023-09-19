const mongoose = require("mongoose");
import { mongooseAggregatePaginate } from "mongoose-aggregate-paginate-v2";
const User = require("../../model/auth/userModel");

const profileSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      default: "John",
    },
    lastName: {
      type: String,
      requird: false,
      default: "Wick",
    },
    countryCode: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: Number,
      default: "",
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

profileSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("Profile", profileSchema);
