const expressAsyncHandler = require("express-async-handler");
const {
  getMongoosePaginationOptions,
} = require("mongoose-aggregate-paginate-v2");
const Profile = require("../../model/ecommerce/profile");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const Order = require("../../model/ecommerce/order");

const getMyEcomProfile = expressAsyncHandler(async (req, res) => {
  let profile = await Profile.findOne({
    owner: req.user._id,
  });

  if (!profile)
    throw new ApiError(
      404,
      "user not found , something went wrong while fetching current user profile"
    );

  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        { currentUserProfile: profile },
        "current user profile fetched successfully"
      )
    );
});

const updateEcomProfile = expressAsyncHandler(async (req, res) => {
  // get user detail for updation from req.body
  // just simply update the user & return the response

  const { firstName, lastName, phoneNumber, countryCode } = req.body;

  const updatedProfile = await Profile.findOneAndUpdate(
    { owner: req.user._id },
    {
      firstName,
      lastName,
      phoneNumber,
      countryCode,
    },
    { new: true }
  );
  if (!updatedProfile)
    throw new ApiError(500, "unable to update profile , something went wrong");

  return res
    .status(201)
    .send(
      new ApiResponse(
        201,
        { profile: updatedProfile },
        "profile update successfully"
      )
    );
});

const getMyOrders = expressAsyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const orderAggregrate = await Order.aggregrate([
    {
      // Get orders associated with the user
      $match: {
        customer: req.user._id,
      },
    },
    {
      $lookup: {
        from: "addresses",
        localField: "address",
        foreignField: "_id",
        as: "address",
      },
    },
    // lookup for a customer associated with the order
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
            },
          },
        ],
      },
    },
    // lookup for a coupon applied while placing the order
    {
      $lookup: {
        from: "coupons",
        foreignField: "_id",
        localField: "coupon",
        as: "coupon",
        pipeline: [
          {
            $project: {
              name: 1,
              couponCode: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        customer: { $first: "$customer" },
        address: { $first: "$address" },
        coupon: { $ifNull: [{ $first: "$coupon" }, null] },
        totalOrderItems: { $size: "$items" },
      },
    },
    {
      $project: {
        items: 0,
      },
    },
  ]);

  const orders = await Order.aggregratePaginate(
    orderAggregrate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalOrders",
        docs: "orders",
      },
    })
  );

  return res
    .status(200)
    .send(new ApiResponse(200, orders, "orders fetched successfully"));
});

module.exports = {
  getMyEcomProfile,
  updateEcomProfile,
  getMyOrders,
};
