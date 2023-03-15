import cors from "cors";
import connection from "./modules/dbConnection.js";
import mail from "./modules/mail.js";
import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import { hashPassword, comparePassword } from "./modules/encrypt_decrypt.js";
import Admin from "./routes/admin.js";
import Login_Register from "./routes/login_register.js";
import appAuth from "./routes/appAuth.js";
import conn from "./modules/mongoose.js";
import SessionScheme from "./schemas/sessionSchema.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
let _db = null;
const PORT = 3050;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(
  session({ secret: "vishnureddy05011", saveUninitialized: true, resave: true })
);
// app.use(express.static("static"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/static/login.html");
});
connection.connectToDb((err) => {
  if (err) return;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
  });
  _db = connection.getDb();
});

const check_session = async (req, res, next) => {
  // const date = Date();
  // let date_ob = new Date(date);
  // //console.log(date_ob.getDate());
  //console.log("check_Session_called");
  //check weather session exist in database and it is true.
  //console.log("check_Session_called");
  //check weather session exist in database and it is true.
  let result = await _db
    .collection("sessions")
    .find({
      username: req.username,
      session_id: req.session_id,
      active: "true",
    })
    .toArray();
  //console.log(result.length, "checking in session,middleware");
  if (result.length != 0) {
    res.send(req.data);
  } else {
    res.send({ data: "no session" });
  }
};

app.get("/logout/:user/:session_id/", async (req, res) => {
  let user = req.params["user"];
  let session_id = req.params["session_id"];
  //console.log(user, session_id);
  //console.log("logout route called");
  var myquery = { username: user, session_id: session_id };
  var newvalues = {
    $set: { active: "false", endtime: Date() },
  };
  await _db
    .collection("sessions")
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
    });
  res.send({ successful: 100 });
});

app.get(
  "/users/:username/:session_id/",
  async (req, res, next) => {
    req.username = req.params["username"];
    req.session_id = req.params["session_id"];
    req.receivedfrom = "users";
    //console.log("get users route called");
    let result = await _db.collection("users").find({}).toArray();
    result.map((person) => delete person.password);
    req.data = result;
    next();
  },
  check_session
);

app.post(
  "/change_password/:user/:session_id/",
  async (req, res, next) => {
    //console.log(req.body);
    var user = req.params["user"];
    req.username = user;
    req.session_id = req.params["session_id"];
    //console.log("change password called", user, req.body.npassword);
    var myquery = { username: user };
    //console.log(user);
    req.body.npassword = await hashPassword(req.body.npassword);
    var newvalues = {
      $set: { username: user, password: req.body.npassword },
    };
    _db.collection("users").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
    });
    req.data = "updated";
    next();
  },
  check_session
);

app.post(
  "/create_user/:username/:session_id/",
  async (req, res, next) => {
    //console.log("create_user called");
    req.username = req.params["username"];
    req.session_id = req.params["session_id"];
    var pemail = req.body.pemail;
    var text = `Your email id is: ${req.body.email}\n Your password is : ${req.body.password}`;
    var subject = "User credentials:";
    mail(pemail, text, subject);
    req.body.password = await hashPassword(req.body.password);
    //console.log("hashed password", req.body.password);
    req.body.username = "";
    req.body.deleted = "false";
    req.body.admin = "false";
    let result = _db.collection("users").insertOne(req.body);
    req.data = "successful";
    next();
  },
  check_session
);

app.post(
  "/update_profile/:username/:session_id/",
  async (req, res, next) => {
    //console.log("update_profile route called");
    //console.log(req.body);
    var username = req.params["username"];
    req.username = username;
    req.session_id = req.params["session_id"];
    //console.log("username", username);
    var temp = req.body;
    var myquery = { username: username };
    var newvalues = {
      $set: temp,
    };
    //console.log("myquery", myquery);
    //console.log("newvalues", newvalues);
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    //console.log("user data updated successfully");
    req.data = "successful";
    next();
  },
  check_session
);

app.get(
  "/delete_user/:username/:user/:session_id/",
  async (req, res, next) => {
    //console.log("delete_user route called");
    let user = req.params["username"];
    let deletedby = req.params["user"];
    req.username = deletedby;
    req.session_id = req.params["session_id"];
    var myquery = { username: user };
    //console.log("deletedby", deletedby);
    //console.log("delete user called", user);
    var newvalues = {
      $set: { deleted: "true", deletedby: deletedby },
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    req.data = "successful";
    next();
  },
  check_session
);

app.get(
  "/add_user/:username/:user/:session_id/",
  async (req, res, next) => {
    let user = req.params["username"];
    let deletedby = req.params["user"];
    req.username = deletedby;
    req.session_id = req.params["session_id"];
    var myquery = { username: user };
    var newvalues = {
      $set: { deleted: "false", deletedby: deletedby },
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    req.data = "successful";
    next();
  },
  check_session
);

app.get(
  "/display_active_users/:username/:session_id/",
  async (req, res, next) => {
    req.username = req.params["username"];
    req.session_id = req.params["session_id"];
    let result = await _db
      .collection("sessions")
      .find({ active: "true" })
      .toArray();
    var active;
    active = result.map((row) => {
      return row.username;
    });
    var final_res = [...new Set(active)];
    req.data = final_res;
    next();
  },
  check_session
);

app.get(
  "/display_non_active_users/:username/:session_id/",
  async (req, res, next) => {
    req.username = req.params["username"];
    req.session_id = req.params["session_id"];
    let result = await _db
      .collection("sessions")
      .find({ active: "false" })
      .toArray();
    result.map((person) => delete person.password);
    var non_active;
    non_active = result.map((row) => {
      return row.username;
    });
    //console.log(non_active, "non_active");
    var final_res = [...new Set(non_active)];
    //console.log(final_res, "final_res");
    req.data = final_res;
    next();
  },
  check_session
);

app.get(
  "/update_role/:username/:role/:updatedby/:session_id/",
  async (req, res, next) => {
    //console.log("update_role called");
    req.username = req.params["updatedby"];
    req.session_id = req.params["session_id"];
    const username = req.params["username"];
    const role = req.params["role"];
    const updatedby = req.params["updatedby"];
    //console.log(username, role, updatedby);
    var myquery = { username: username };
    var newvalues = {
      $set: { role: role, updatedby: updatedby },
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        //console.log("1 document updated");
      });
    req.data = "updated";
    next();
  },
  check_session
);

app.get("/health", (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: "Ok",
    date: new Date(),
  };

  res.status(200).send(data);
});

app.use(appAuth);
app.use("/", Admin);
app.use("/", Login_Register);
