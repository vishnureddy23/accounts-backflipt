app.get("/add_role/:role/:level", async (req, res) => {
  const role = req.params["role"];
  const level = req.params["level"];
  _db.collection("roles").updateOne(
    {},
    {
      $push: {
        roles: {
          $each: ["ASE"],
          $position: 4,
        },
      },
    }
  );
  res.send("role updated successfully");
});