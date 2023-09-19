import mongoose from "mongoose";
import { userModel as User } from "../auth/userModel";
import { Category } from "../ecommerce/category";
import { mongooseAggregatePaginate } from "mongoose-aggregate-paginate-v2";

const productSchema = new mongoose.Schema(
  {
    category: {
      ref: "Category",
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    discription: {
      type: String,
      required: true,
    },
    image: {
      type: {
        url: String,
        localPath: String,
      },
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    owner: {
      ref: "User",
      type: mongoose.SchemaTypes.ObjectId,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      default: 0,
      type: Number,
    },
    subImage: {
      type: {
        url: String,
        localPath: String,
      },
      default: [],
    },
  },
  { timestamps: true }
);

productSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("Product", productSchema);
