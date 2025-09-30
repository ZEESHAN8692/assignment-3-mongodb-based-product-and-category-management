import mongoose from "mongoose";
import productModel from "../model/productModel.js";
import categoryModel from "../model/categoryModel.js";

class ProductController {
  // Create Product
  async createProduct(req, res) {
    try {
      const { name, price, category, stock } = req.body;

      if (!name || !price || !category) {
        return res.status(400).json({ message: "Name, Price, and Category are required" });
      }

      const cat = await categoryModel.findById(category);
      if (!cat) {
        return res.status(404).json({ message: "Category not found" });
      }

      const product = await productModel.create({ name, price, category, stock });
      res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get All Products (with category details using aggregation)
  async getProducts(req, res) {
    try {
      const products = await productModel.aggregate([
        {
          $lookup: {
            from: "categories", 
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails",
        },
        {
          $project: {
            name: 1,
            price: 1,
            stock: 1,
            "categoryDetails._id": 1,
            "categoryDetails.name": 1,
          },
        },
      ]);

      res.status(200).json({ message: "Products fetched successfully", products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  //  Get Single Product
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const product = await productModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        { $unwind: "$categoryDetails" },
        {
          $project: {
            name: 1,
            price: 1,
            stock: 1,
            "categoryDetails._id": 1,
            "categoryDetails.name": 1,
          },
        },
      ]);

      if (!product || product.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product found", product: product[0] });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  //  Update Product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, price, stock, category } = req.body;

      if (category) {
        const cat = await categoryModel.findById(category);
        if (!cat) {
          return res.status(404).json({ message: "Category not found" });
        }
      }

      const updated = await productModel.findByIdAndUpdate(
        id,
        { name, price, stock, category },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product updated successfully", updated });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Delete Product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const deleted = await productModel.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get Products with stock < 1
  async getOutOfStockProducts(req, res) {
    try {
      const products = await productModel.aggregate([
        { $match: { stock: { $lt: 1 } } },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        { $unwind: "$categoryDetails" },
        {
          $project: {
            name: 1,
            price: 1,
            stock: 1,
            "categoryDetails._id": 1,
            "categoryDetails.name": 1,
          },
        },
      ]);

      res.status(200).json({ message: "Out of stock products", products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new ProductController();
