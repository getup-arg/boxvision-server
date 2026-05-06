const express = require("express");
const router = express.Router();
const db = require("../../../config/db-totem");

router.get("/", (req, res, next) => {
  db.query("SELECT * FROM recetaGraduacion_tablets", function (err, results) {
    if (err) {
      console.error("DB error GET /tablets/graduacion:", err);
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ data: results });
  });
});

router.get("/:pedidoId", (req, res, next) => {
  const pedidoId = req.params.pedidoId;

  db.query(
    "SELECT 'Ojo Derecho' as 'Ojo', " +
      "esfera_derecho as 'esfera', cilindro_derecho as 'cilindro', eje_derecho as 'eje', " +
      "prisma_derecho as 'prisma', base_derecho as 'base', adicion_derecho as 'adicion' " +
      "FROM recetaGraduacion_tablets " +
      "INNER JOIN pedido_tablets ON recetaGraduacion_tablets.id = pedido_tablets.idRecetaGraduacion " +
      "WHERE pedido_tablets.idPedido = ? " +
      "UNION " +
      "SELECT 'Ojo Izquierdo', " +
      "esfera_izquierdo as 'esfera', cilindro_izquierdo as 'cilindro', eje_izquierdo as 'eje', " +
      "prisma_izquierdo as 'prisma', base_izquierdo as 'base', adicion_izquierdo as 'adicion' " +
      "FROM recetaGraduacion_tablets " +
      "INNER JOIN pedido_tablets ON recetaGraduacion_tablets.id = pedido_tablets.idRecetaGraduacion " +
      "WHERE pedido_tablets.idPedido = ?",
    [pedidoId, pedidoId],
    function (err, results) {
      if (err) {
        console.error("DB error GET /tablets/graduacion/:pedidoId:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

router.post("/", (req, res, next) => {
  const receta = {
    esfera_derecho: req.body.values.esfera_derecho,
    cilindro_derecho: req.body.values.cilindro_derecho,
    eje_derecho: req.body.values.eje_derecho,
    prisma_derecho: req.body.values.prisma_derecho,
    base_derecho: req.body.values.base_derecho,
    esfera_izquierdo: req.body.values.esfera_izquierdo,
    cilindro_izquierdo: req.body.values.cilindro_izquierdo,
    eje_izquierdo: req.body.values.eje_izquierdo,
    prisma_izquierdo: req.body.values.prisma_izquierdo,
    base_izquierdo: req.body.values.base_izquierdo,
    adicion_derecho: req.body.values.adicion_derecho,
    adicion_izquierdo: req.body.values.adicion_izquierdo,
  };

  db.query(
    "INSERT INTO `recetaGraduacion_tablets`(`esfera_derecho`, `cilindro_derecho`, `eje_derecho`, `prisma_derecho`, `base_derecho`, `adicion_derecho`, `adicion_izquierdo`, `base_izquierdo`, `esfera_izquierdo`, `cilindro_izquierdo`, `eje_izquierdo`, `prisma_izquierdo`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    [receta.esfera_derecho, receta.cilindro_derecho, receta.eje_derecho, receta.prisma_derecho, receta.base_derecho, receta.adicion_derecho, receta.adicion_izquierdo, receta.base_izquierdo, receta.esfera_izquierdo, receta.cilindro_izquierdo, receta.eje_izquierdo, receta.prisma_izquierdo],
    function (err, results) {
      if (err) {
        console.error("DB error POST /tablets/graduacion:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

module.exports = router;
