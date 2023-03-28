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
  let result = await _db
    .collection("sessions")
    .find({
      username: req.params["username"],
      session_id: req.params["session_id"],
      active: "true",
    })
    .toArray();
  if (result.length != 0) {
    next();
  } else {
    res.status(401).send("no session");
  }
};

app.get("/logout/:user/:session_id/", check_session, async (req, res) => {
  let user = req.params["user"];
  let session_id = req.params["session_id"];
  var myquery = { username: user, session_id: session_id };
  var newvalues = {
    $set: { active: "false", endtime: Date() },
  };
  await _db
    .collection("sessions")
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
    });
  res.send(true);
});

app.get(
  "/users/:username/:session_id/",
  check_session,
  async (req, res, next) => {
    let result = await _db.collection("users").find({}).toArray();
    result.map((person) => delete person.password);
    res.send(result);
  }
);

app.post(
  "/change_password/:username/:session_id/",
  check_session,
  async (req, res, next) => {
    var user = req.params["username"];
    var myquery = { username: user };
    req.body.npassword = await hashPassword(req.body.npassword);
    var newvalues = {
      $set: { username: user, password: req.body.npassword },
    };
    _db.collection("users").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
    });
    res.send(true);
  }
);

app.post(
  "/create_user/:username/:session_id/",
  check_session,
  async (req, res, next) => {
    var pemail = req.body.pemail;
    var text = `Your email id is: ${req.body.email}\n Your password is : ${req.body.password}`;
    var subject = "User credentials:";
    var mail_response = mail(pemail, text, subject);
    if (mail_response == false) {
      res.send(false);
    }
    req.body.password = await hashPassword(req.body.password);
    req.body.username = "";
    req.body.deleted = "false";
    req.body.admin = "false";
    req.body.role = "GUEST";
    req.body.team = "GUEST";
    let result = await _db.collection("users").insertOne(req.body);
    res.send(true);
  }
);

app.post(
  "/update_profile/:username/:session_id/",
  check_session,
  async (req, res, next) => {
    var username = req.params["username"];
    var temp = req.body;
    var myquery = { username: username };
    var newvalues = {
      $set: temp,
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    res.send(true);
  }
);

app.get(
  "/delete_user/:user/:username/:session_id/",
  check_session,
  async (req, res, next) => {
    let user = req.params["user"];
    let deletedby = req.params["username"];
    var myquery = { username: user };
    var newvalues = {
      $set: { deleted: "true", deletedby: deletedby },
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    res.send(true);
  }
);

app.get(
  "/add_user/:user/:username/:session_id/",
  check_session,
  async (req, res, next) => {
    let user = req.params["user"];
    let deletedby = req.params["username"];
    var myquery = { username: user };
    var newvalues = {
      $set: { deleted: "false", deletedby: deletedby },
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    res.send(true);
  }
);

app.get(
  "/display_active_users/:username/:session_id/",
  check_session,
  async (req, res, next) => {
    let result = await _db
      .collection("sessions")
      .find({ active: "true" })
      .toArray();
    var active;
    active = result.map((row) => {
      return row.username;
    });
    var final_res = [...new Set(active)];
    res.send(final_res);
  }
);

app.get(
  "/display_non_active_users/:username/:session_id/",
  check_session,
  async (req, res, next) => {
    let result = await _db
      .collection("sessions")
      .find({ active: "false" })
      .toArray();
    result.map((person) => delete person.password);
    var non_active;
    non_active = result.map((row) => {
      return row.username;
    });
    var final_res = [...new Set(non_active)];
    res.send(final_res);
  }
);

app.get(
  "/update_role/:user/:role/:username/:session_id/",
  check_session,
  async (req, res) => {
    const username = req.params["user"];
    const role = req.params["role"];
    const updatedby = req.params["username"];
    var myquery = { username: username };
    var newvalues = {
      $set: { role: role, updatedby: updatedby },
    };
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    res.status(200).send(true);
  }
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
