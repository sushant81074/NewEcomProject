import mongoose from "mongoose";

import {
  AvailablePaymentProviders,
  AvailableOrderStatuses,
  OrderStatusEnum,
  PaymentProviderEnum,
} from "../../constants";
import { Coupon } from "../ecommerce/coupon";
import { Address } from "../ecommerce/address";
import { Product } from "../ecommerce/product";
import { User } from "../auth/userModel";
import { mongooseAggregatePaginate } from "mongoose-aggregate-paginate-v2";

const orderSchema = new mongoose.Schema(
  {
    orderPrice: {
      type: Number,
      required: true,
    },
    discountedOrderPrice: {
      type: Number,
      required: true,
    },
    coupon: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Coupon",
      default: null,
    },
    customer: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    items: {
      type: [
        {
          productId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "quantity can't be less than 1"],
            default: 1,
          },
        },
      ],
      default: [],
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    status: {
      type: String,
      enum: AvailableOrderStatuses,
      default: OrderStatusEnum.PENDING,
    },
    paymentProvider: {
      type: String,
      enum: AvailablePaymentProviders,
      default: PaymentProviderEnum.UNKNOWN,
    },
    paymentId: {
      type: String,
    },
    // This field shows if the payment is done or not
    isPaymentDone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("Order", orderSchema);
