import express, { Router } from "express";
import connection from "../modules/dbConnection.js";
import { hashPassword, comparePassword } from "../modules/encrypt_decrypt.js";
let _db = null;
const router = express.Router();

connection.connectToDb((err) => {
  if (err) return;
  _db = connection.getDb();
});

router.post("/registration", async (req, res) => {
  //console.log("registration route called", req.body.email, req.body.password);
  //console.log(req.body);
  let result = await _db
    .collection("users")
    .find({ email: req.body.email })
    .toArray();
  if (result.length != 0) {
    var match = await comparePassword(req.body.password, result[0].password);
    if (match == true) {
      var temp = req.body;
      delete temp.password;
      req.registeredon = Date();
      var myquery = { email: req.body.email };
      var newvalues = {
        $set: temp,
      };
      await _db
        .collection("users")
        .updateOne(myquery, newvalues, function (err, res) {
          if (err) {
            throw err;
          }
        });
      res.status(200).json({ successful: 100 });
    } else {
      res.send("invalid");
    }
  } else {
    res.send("invalid");
  }
});

router.get("/roles", async (req, res) => {
  let result = await _db.collection("roles").find({}).toArray();
  res.send(result[0].roles);
});

// router.post("/user_login", async (req, res) => {
//   //console.log("trying to login");
//   req.user = req.body;
//   let result = await _db
//     .collection("users")
//     .find({ username: req.body.username })
//     .toArray();

  

//   if (!await bcrypt.compare(req.body.password, doc.password)) {
//     res.status(200).json({ errno: 100 });
//   } else {
//     req.session.save();
//     let session_data = {
//       username: req.body.username,
//       session_id: req.sessionID,
//       active: "true",
//       starttime: Date(),
//     };
//     _db.collection("sessions").insertOne(session_data);
//     res.status(200).json({
//       username: req.body.username,
//       session_id: session_data.session_id,
//       admin: result[0].admin,
//       role: result[0].role,
//       team: result[0].team,
//     });
//   }
// });

router.get("/display_all_emails", async (req, res) => {
  //console.log("displaying all emails");
  let result = await _db.collection("users").find({}).toArray();
  var active;
  active = result.map((row) => {
    return row.email;
  });
  var final_res = [...new Set(active)];
  res.send(final_res);
});

router.post("/forgot_password", async (req, res) => {
  //console.log("forgot password route called");
  var myquery = { username: req.body.username, email: req.body.email };
  req.body.password = await hashPassword(req.body.password);
  const update = {
    password: req.body.password,
  };
  var newvalues = {
    $set: update,
  };
  let result = await _db
    .collection("users")
    .find({
      username: req.body.username,
      email: req.body.email,
    })
    .toArray();

  if (result.length == 0) {
    res.send("username or email invald");
  } else {
    await _db
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
      });
    res.send("successful");
  }
});

router.get("/update_for_all", async (req, res) => {
  var myquery = {};
  const update = {
    deleted: "false",
    active: "true",
  };
  var newvalues = {
    $set: update,
  };
  _db.collection("users").updateMany(myquery, newvalues, function (err, res) {
    if (err) throw err;
  });
  res.status(200).json({ successful: 100 });
});

router.get("/display_all_users", async (req, res) => {
  let result = await _db.collection("users").find({}).toArray();
  var active;
  active = result.map((row) => {
    return row.username;
  });
  var final_res = [...new Set(active)];
  res.send(final_res);
});

router.get("/users/:username/", async (req, res) => {
  let username = req.params["username"];
  //console.log("/users/username called", username);
  let result = await _db
    .collection("users")
    .find({ username: username })
    .toArray();
  result.map((person) => delete person.password);
  res.status(200).json({ user_data: result });
});

export default router;
