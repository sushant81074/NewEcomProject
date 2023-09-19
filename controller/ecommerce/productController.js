const mongoose = require("mongoose");
const expressAsyncHandler = require("express-async-handler");

const Product = require("../../model/ecommerce/product");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ApiError } = require("../../utils/ApiError");

const createProduct = expressAsyncHandler(async (req, res) => {});
const deleteProduct = expressAsyncHandler(async (req, res) => {});
const getAllProducts = expressAsyncHandler(async (req, res) => {});
const getProductById = expressAsyncHandler(async (req, res) => {});
const getProductsByCategory = expressAsyncHandler(async (req, res) => {});
const updateProduct = expressAsyncHandler(async (req, res) => {});
const removeProductSubImage = expressAsyncHandler(async (req, res) => {});

export {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  updateProduct,
  removeProductSubImage,
};
