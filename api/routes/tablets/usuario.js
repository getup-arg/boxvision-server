const express = require("express");
const router = express.Router();
const db = require("../../../config/db-totem");

router.get("/", (req, res, next) => {
  db.query("SELECT * FROM usuarioAfiliado_tablets", function (err, results) {
    if (err) {
      console.error("DB error GET /tablets/usuario:", err);
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ data: results });
  });
});

router.post("/", (req, res, next) => {
  const usuario = {
    nombre: req.body.values.first_name,
    apellido: req.body.values.last_name,
    numeroAfiliado: req.body.values.num_afiliado,
    email: req.body.values.email,
    telefono: req.body.values.telefono,
    direccion: req.body.values.direccion,
    ciudad: req.body.values.ciudad,
    provincia: req.body.values.provincia,
  };

  db.query(
    "INSERT INTO `usuarioAfiliado_tablets`(`nombre`, `apellido`, `numeroAfiliado`, `email`, `telefono`, `direccion`, `ciudad`, `provincia`) VALUES (?,?,?,?,?,?,?,?)",
    [usuario.nombre, usuario.apellido, usuario.numeroAfiliado, usuario.email, usuario.telefono, usuario.direccion, usuario.ciudad, usuario.provincia],
    function (err, results) {
      if (err) {
        console.error("DB error POST /tablets/usuario:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

module.exports = router;
