import mongoose from "mongoose";
const Schema = mongoose.Schema;
const SessionScheme = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    session_id: {
      type: String,
      required: true,
    },
    role: {
      type: Boolean,
      default: false,
    },
    active: {
      type: String,
      default: "false",
    },
  },
  { collection: "sessions", timestamps: true }
);

export default new mongoose.model("SessionScheme", SessionScheme);
