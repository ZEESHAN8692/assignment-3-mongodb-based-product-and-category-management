import categoryModel from "../model/categoryModel.js";

class CategoryController {
  // ✅ Create Category
  async createCategory(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const exist = await categoryModel.findOne({ name });
      if (exist) {
        return res.status(400).json({ message: "Category already exists" });
      }

      const category = await categoryModel.create({ name });
      res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get All Categories (with aggregation pipeline)
  async getCategories(req, res) {
    try {
      const categories = await categoryModel.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category",
            as: "products",
          },
        },
        {
          $addFields: {
            totalProducts: { $size: "$products" },
          },
        },
        {
          $project: {
            name: 1,
            totalProducts: 1,
            products: 1,
          },
        },
      ]);

      res.status(200).json({ message: "Categories fetched successfully", categories });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  //  Get Single Category
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const category = await categoryModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category",
            as: "products",
          },
        },
        {
          $addFields: {
            totalProducts: { $size: "$products" },
          },
        },
      ]);

      if (!category || category.length === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ message: "Category found", category: category[0] });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update Category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const updated = await categoryModel.findByIdAndUpdate(
        id,
        { name },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ message: "Category updated successfully", updated });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Delete Category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const deleted = await categoryModel.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new CategoryController();
