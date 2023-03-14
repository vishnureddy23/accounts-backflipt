import mongoose from "mongoose";

mongoose.set("strictQuery", false);

try {
  mongoose.connect(
    "mongodb+srv://bfSuite:backflipt@cluster0.hsvl4jm.mongodb.net/Accounts",
    {
      useNewUrlParser: true,
    }
  );
} catch (e) {
  throw e;
}
const conn = mongoose.connection;
conn.on("connected", () => {
  console.log("database is connected successfully");
});
conn.on("error", console.error.bind(console, "connection error:"));
export default conn;
