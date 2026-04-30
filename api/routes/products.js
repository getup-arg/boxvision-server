const express = require("express");
const router = express.Router();
const db = require("../../config/db-totem");

router.get("/", (req, res, next) => {
  db.query(
    "SELECT product.*," +
      "CONCAT('Esfera Uno ',rangograduacion.esferaunodesde ,'-', rangograduacion.esferaunohasta," +
      "',Cilindro Uno ',rangograduacion.cilindrounodesde,'-',rangograduacion.cilindrounohasta," +
      "' // Esfera Dos ',rangograduacion.esferadosdesde ,'-', rangograduacion.esferadoshasta," +
      "',Cilindro Dos ',rangograduacion.cilindrodosdesde,'-',rangograduacion.cilindrodoshasta)" +
      " AS 'graduaciondesc',tipolenteprod.nombre as 'tipolente' FROM product " +
      "LEFT OUTER JOIN rangograduacion ON product.rangograduacion = rangograduacion.id " +
      "LEFT OUTER JOIN product as tipolenteprod ON product.idTipoLente = tipolenteprod.id",
    function (err, results) {
      if (err) {
        console.error("DB error GET /products:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;

  if (id === "tipolentes") {
    db.query(
      "SELECT product.id as 'value', product.nombre as 'label',product.rangograduacion,product.precio," +
        "CONCAT('Esfera Uno ',rangograduacion.esferaunodesde ,'-', rangograduacion.esferaunohasta," +
        "',Cilindro Uno ',rangograduacion.cilindrounodesde,'-',rangograduacion.cilindrounohasta," +
        "' // Esfera Dos ',rangograduacion.esferadosdesde ,'-', rangograduacion.esferadoshasta," +
        "',Cilindro Dos ',rangograduacion.cilindrodosdesde,'-',rangograduacion.cilindrodoshasta)" +
        "AS 'graduaciondesc' FROM product " +
        "LEFT OUTER JOIN rangograduacion ON product.rangograduacion = rangograduacion.id WHERE tipo = 'lente' " +
        "ORDER BY product.precio ASC",
      function (err, results) {
        if (err) {
          console.error("DB error GET /products/tipolentes:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ data: results });
      }
    );
  } else if (id === "antireflejo") {
    const idTipoLente = req.query.idTipoLente;
    db.query(
      "SELECT product.id as 'value', product.nombre as 'label', product.precio FROM product " +
        "WHERE tipo = 'antireflejo' AND idTipoLente = ? ORDER BY product.precio ASC",
      [idTipoLente],
      function (err, results) {
        if (err) {
          console.error("DB error GET /products/antireflejo:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ data: results });
      }
    );
  } else if (id === "fotocromatico") {
    const idTipoLente = req.query.idTipoLente;
    db.query(
      "SELECT product.id as 'value', product.nombre as 'label', product.precio FROM product " +
        "WHERE tipo = 'fotocromatico' AND idTipoLente = ? ORDER BY product.precio ASC",
      [idTipoLente],
      function (err, results) {
        if (err) {
          console.error("DB error GET /products/fotocromatico:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ data: results });
      }
    );
  } else if (id === "marcos") {
    db.query(
      "SELECT * FROM product WHERE tipo = 'marco' ORDER BY product.precio ASC",
      function (err, results) {
        if (err) {
          console.error("DB error GET /products/marcos:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ data: results });
      }
    );
  } else {
    db.query(
      "SELECT * FROM product WHERE id = ?",
      [id],
      function (err, results) {
        if (err) {
          console.error("DB error GET /products/:id:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ data: results });
      }
    );
  }
});

router.patch("/increase/:valueIncrease", (req, res, next) => {
  const factor = 1 + req.params.valueIncrease / 100;
  db.query("UPDATE product SET precio = CEIL(precio * ?)", [factor], (err) => {
    if (err) {
      console.error("DB error PATCH /products/increase:", err);
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Precios actualizados exitosamente" });
  });
});

router.patch("/decrease/:valueDecrease", (req, res, next) => {
  const factor = 1 - req.params.valueDecrease / 100;
  db.query("UPDATE product SET precio = CEIL(precio * ?)", [factor], (err) => {
    if (err) {
      console.error("DB error PATCH /products/decrease:", err);
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Precios actualizados exitosamente" });
  });
});

router.patch("/:productId", (req, res, next) => {
  const product = {
    id: req.body.values.id,
    nombre: req.body.values.nombre,
    precio: req.body.values.precio,
    tipo: req.body.values.tipo,
    rangograduacion: req.body.values.rangograduacion,
    idTipoLente: req.body.values.idTipoLente,
    label: req.body.values.label,
  };

  db.query(
    "UPDATE `product` SET `nombre` = ?, `precio` = ?, `tipo` = ?, `rangograduacion` = ?, `idTipoLente` = ?, `label` = ? WHERE id = ?",
    [product.nombre, product.precio, product.tipo, product.rangograduacion, product.idTipoLente, product.label, product.id],
    function (err, results) {
      if (err) {
        console.error("DB error PATCH /products/:id:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

router.delete("/:productId", (req, res, next) => {
  db.query(
    "DELETE FROM `product` WHERE id = ?",
    [req.params.productId],
    function (err, results) {
      if (err) {
        console.error("DB error DELETE /products/:id:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

router.post("/", (req, res, next) => {
  const product = {
    nombre: req.body.values.nombre,
    precio: req.body.values.precio,
    tipo: req.body.values.tipo,
    rangograduacion: req.body.values.rangograduacion,
    label: req.body.values.label,
    idTipoLente: req.body.values.idTipoLente,
  };

  db.query(
    "INSERT INTO `product`(`nombre`, `precio`, `tipo`, `rangograduacion`, `label`, `idTipoLente`) VALUES (?,?,?,?,?,?)",
    [product.nombre, product.precio, product.tipo, product.rangograduacion, product.label, product.idTipoLente],
    function (err, results) {
      if (err) {
        console.error("DB error POST /products:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

module.exports = router;
