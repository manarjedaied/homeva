import mongoose from "mongoose";

export const createSlug = (value) => {
  if (!value) return "";
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      default: "",
      maxlength: 500
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
