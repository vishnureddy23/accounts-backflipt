import mongoose from "mongoose";
const Schema = mongoose.Schema;

const User = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    admin: {
      type: String,
      default: "",
    },
    firstname: {
      type: String,
      default: "",
    },
    lastname: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    contact: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    registeredon: {
      type: String,
      default: "",
    },
    team: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "",
    },
    deleted: {
      type: String,
      default: "false",
    },
    updatedby: {
      type: String,
      default: "",
    },
    deletedby: {
      type: String,
      default: "",
    },
  },
  { collection: "users", timestamps: true }
);
export default new mongoose.model("User", User);
