import { addressModel as Address } from "../../model/ecommerce/address";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { expressAsyncHandler } from "express-async-handler";
import { getMongoosePaginationOptions } from "mongoose-aggregate-paginate-v2";

const createAddress = expressAsyncHandler(async (req, res) => {
  const { addressLine1, addressLine2, country, pincode, state } = req.body;
  if (!addressLine1 || !addressLine2 || !country || !pincode || !state)
    throw new ApiError(400, "every field is required");

  const owner = req.user._id;

  if (
    await Address.create({
      addressLine1,
      addressLine2,
      country,
      owner,
      pincode,
      state,
    })
  )
    res
      .status(201)
      .send(new ApiResponse(201, {}, { message: "address saved in database" }));
  else
    throw new ApiError(
      500,
      "something went wrong , unable to save address in database"
    );
});

const getAllAddresses = expressAsyncHandler(async (req, res) => {
  const { page = 1, limit = 1 } = req.query;

  const addressAggregration = Address.aggregrate([
    {
      $match: {
        owner: req.user._id,
      },
    },
  ]);

  const address = await Address.aggregratePaginate(
    addressAggregration,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalAddresses",
        docs: "addresses",
      },
    })
  );

  res
    .status(201)
    .send(new ApiResponse(201, address, "all addresses successfully fetched"));
});

const getAddressById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  const address = await Address.findOne({
    _id: id,
    owner: req.user._id,
  });

  if (!address) throw new ApiError(404, "address not found");
  else
    return res
      .status(200)
      .send(new ApiResponse(200, address, "address successfully fetched"));
});

const updateAddress = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { addressLine1, addressLine2, country, owner, pincode, state } =
    req.body;

  const updatedAddress = await Address.findOneAndUpdate(
    {
      _id: id,
      owner: req.user._id,
    },
    {
      $set: {
        addressLine1,
        addressLine2,
        country,
        owner,
        pincode,
        state,
      },
    },
    { new: true }
  );

  if (!updateAddress) throw new ApiError(404, "address doesn't exist");
  else
    return res
      .status(201)
      .send(new ApiResponse("address updated successfully"));
});

const deleteAddress = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const address = await Address.findOneAndDelete({
    _id: id,
    owner: req.user._id,
  });

  if (!address) throw new ApiError(404, "address not found for deletion");
  else
    return res
      .status(201)
      .send(
        new ApiResponse(
          201,
          { deletedAddress: address },
          "address deleted successfully"
        )
      );
});

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
