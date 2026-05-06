const express = require("express");
const router = express.Router();
const db = require("../../../config/db-totem");

router.get("/", (req, res, next) => {
  db.query(
    "SELECT product_tablets.*," +
      "CONCAT('Esfera Uno ',rangograduacion_tablets.esferaunodesde ,'-', rangograduacion_tablets.esferaunohasta," +
      "',Cilindro Uno ',rangograduacion_tablets.cilindrounodesde,'-',rangograduacion_tablets.cilindrounohasta," +
      "' // Esfera Dos ',rangograduacion_tablets.esferadosdesde ,'-', rangograduacion_tablets.esferadoshasta," +
      "',Cilindro Dos ',rangograduacion_tablets.cilindrodosdesde,'-',rangograduacion_tablets.cilindrodoshasta)" +
      " AS 'graduaciondesc',tipolenteprod.nombre as 'tipolente' FROM product_tablets " +
      "LEFT OUTER JOIN rangograduacion_tablets ON product_tablets.rangograduacion = rangograduacion_tablets.id " +
      "LEFT OUTER JOIN product_tablets as tipolenteprod ON product_tablets.idTipoLente = tipolenteprod.id",
    function (err, results) {
      if (err) {
        console.error("DB error GET /tablets/products:", err);
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
      "SELECT product_tablets.id as 'value', product_tablets.nombre as 'label',product_tablets.rangograduacion,product_tablets.precio," +
        "CONCAT('Esfera Uno ',rangograduacion_tablets.esferaunodesde ,'-', rangograduacion_tablets.esferaunohasta," +
        "',Cilindro Uno ',rangograduacion_tablets.cilindrounodesde,'-',rangograduacion_tablets.cilindrounohasta," +
        "' // Esfera Dos ',rangograduacion_tablets.esferadosdesde ,'-', rangograduacion_tablets.esferadoshasta," +
        "',Cilindro Dos ',rangograduacion_tablets.cilindrodosdesde,'-',rangograduacion_tablets.cilindrodoshasta)" +
        "AS 'graduaciondesc' FROM product_tablets " +
        "LEFT OUTER JOIN rangograduacion_tablets ON product_tablets.rangograduacion = rangograduacion_tablets.id WHERE tipo = 'lente' " +
        "ORDER BY product_tablets.precio ASC",
      function (err, results) {
        if (err) {
          console.error("DB error GET /tablets/products/tipolentes:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ data: results });
      }
    );
  } else if (id === "antireflejo") {
    const idTipoLente = req.query.idTipoLente;
    db.query(
      "SELECT product_tablets.id as 'value', product_tablets.nombre as 'label', product_tablets.precio FROM product_tablets " +
        "WHERE tipo = 'antireflejo' AND idTipoLente = ? ORDER BY product_tablets.precio ASC",
      [idTipoLente],
      function (err, results) {
        if (err) {
          console.error("DB error GET /tablets/products/antireflejo:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ data: results });
      }
    );
  } else if (id === "fotocromatico") {
    const idTipoLente = req.query.idTipoLente;
    db.query(
      "SELECT product_tablets.id as 'value', product_tablets.nombre as 'label', product_tablets.precio FROM product_tablets " +
        "WHERE tipo = 'fotocromatico' AND idTipoLente = ? ORDER BY product_tablets.precio ASC",
      [idTipoLente],
      function (err, results) {
        if (err) {
          console.error("DB error GET /tablets/products/fotocromatico:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ data: results });
      }
    );
  } else if (id === "marcos") {
    db.query(
      "SELECT * FROM product_tablets WHERE tipo = 'marco' ORDER BY product_tablets.precio ASC",
      function (err, results) {
        if (err) {
          console.error("DB error GET /tablets/products/marcos:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ data: results });
      }
    );
  } else {
    db.query(
      "SELECT * FROM product_tablets WHERE id = ?",
      [id],
      function (err, results) {
        if (err) {
          console.error("DB error GET /tablets/products/:id:", err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ data: results });
      }
    );
  }
});

router.patch("/increase/:valueIncrease", (req, res, next) => {
  const factor = 1 + req.params.valueIncrease / 100;
  db.query("UPDATE product_tablets SET precio = CEIL(precio * ?)", [factor], (err) => {
    if (err) {
      console.error("DB error PATCH /tablets/products/increase:", err);
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Precios actualizados exitosamente" });
  });
});

router.patch("/decrease/:valueDecrease", (req, res, next) => {
  const factor = 1 - req.params.valueDecrease / 100;
  db.query("UPDATE product_tablets SET precio = CEIL(precio * ?)", [factor], (err) => {
    if (err) {
      console.error("DB error PATCH /tablets/products/decrease:", err);
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
    descripcion: req.body.values.descripcion,
    imgUrl: req.body.values.imgUrl,
    galleryImages: req.body.values.galleryImages || null,
    instagramLink: req.body.values.instagramLink,
    color: req.body.values.color,
  };

  db.query(
    "UPDATE `product_tablets` SET `nombre` = ?, `precio` = ?, `tipo` = ?, `rangograduacion` = ?, `idTipoLente` = ?, `label` = ?, `descripcion` = ?, `imgUrl` = ?, `galleryImages` = ?, `instagramLink` = ?, `color` = ? WHERE id = ?",
    [product.nombre, product.precio, product.tipo, product.rangograduacion, product.idTipoLente, product.label, product.descripcion, product.imgUrl, product.galleryImages, product.instagramLink, product.color, product.id],
    function (err, results) {
      if (err) {
        console.error("DB error PATCH /tablets/products/:id:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

router.delete("/:productId", (req, res, next) => {
  db.query(
    "DELETE FROM `product_tablets` WHERE id = ?",
    [req.params.productId],
    function (err, results) {
      if (err) {
        console.error("DB error DELETE /tablets/products/:id:", err);
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
    label: req.body.values.label || "",
    idTipoLente: req.body.values.idTipoLente,
    descripcion: req.body.values.descripcion,
    imgUrl: req.body.values.imgUrl || "",
    galleryImages: req.body.values.galleryImages || null,
    instagramLink: req.body.values.instagramLink,
    color: req.body.values.color,
  };

  db.query(
    "INSERT INTO `product_tablets`(`nombre`, `precio`, `tipo`, `rangograduacion`, `label`, `idTipoLente`, `descripcion`, `imgUrl`, `galleryImages`, `instagramLink`, `color`) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [product.nombre, product.precio, product.tipo, product.rangograduacion, product.label, product.idTipoLente, product.descripcion, product.imgUrl, product.galleryImages, product.instagramLink, product.color],
    function (err, results) {
      if (err) {
        console.error("DB error POST /tablets/products:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

module.exports = router;
