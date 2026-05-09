const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../config/db-totem");

/*
router.post("/signupadmin", (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    db.query(
      "INSERT INTO `adminuser`(`username`, `password`) VALUES (?, ?)",
      [req.body.user, hash],
      function (err) {
        if (err) {
          console.error("DB error POST /signupadmin:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ message: "Signup Success" });
      }
    );
  });
});*/

router.post("/", (req, res) => {
  var appData = {};
  var user = req.body.user;

  db.query(
    "SELECT * FROM adminuser WHERE username = ?",
    [user.usuario],
    function (err, rows) {
      if (err) {
        console.error("DB error POST /login:", err);
        appData.error = 1;
        appData.data = "Error Occured!";
        return res.send(appData);
      }
      if (rows.length > 0) {
        bcrypt.compare(user.password, rows[0].password, (err, result) => {
          if (err) {
            appData.error = 1;
            appData.data = "Auth Failed";
            return res.send(appData);
          }
          if (result) {
            const token = jwt.sign(
              { user: rows[0].username },
              process.env.JWT_SECRET,
              { expiresIn: 3600 * 12 }
            );
            appData.error = 0;
            appData.data = "Auth Success";
            appData.token = token;
            appData.expiresIn = 3600 * 12;
            return res.send(appData);
          }
          appData.error = 1;
          appData.data = "Auth Failed";
          return res.send(appData);
        });
      } else {
        appData.error = 1;
        appData.data = "Auth Failed";
        return res.send(appData);
      }
    }
  );
});

module.exports = router;
