import mongoose from "mongoose";
import { userModel as User } from "../auth/userModel";
import { AvailableCouponTypes, CouponTypesEnum } from "../../constants";
import { mongooseAggregatePaginate } from "mongoose-aggregate-paginate-v2";

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: AvailableCouponTypes,
    default: CouponTypesEnum,
  },
  discountValue: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  minimumCartValue: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    default: Date.null,
  },
  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
});

couponSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("Coupon", couponSchema);
