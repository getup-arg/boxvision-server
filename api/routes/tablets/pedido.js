const express = require("express");
const router = express.Router();
const db = require("../../../config/db-totem");

// GET: lista pedidos no borrados
router.get("/", (req, res, next) => {
  db.query(
    "SELECT * FROM pedido_tablets " +
      "INNER JOIN usuarioAfiliado_tablets ON pedido_tablets.idUsuario = usuarioAfiliado_tablets.id " +
      "WHERE borrado = 0",
    function selectPedidos(err, results, fields) {
      if (err) {
        console.error("DB error GET /pedido:", err);
        return res
          .status(500)
          .json({ ok: false, error: "DB_ERROR", message: err.message });
      }
      return res.status(200).json({ data: results });
    },
  );
});

// GET: detalle de pedido (productos)
router.get("/:pedidoId", (req, res, next) => {
  const id = req.params.pedidoId;

  db.query(
    "SELECT pp.idProducto, pp.precio as 'precioOrden', pp.color, p.* " +
      "FROM `pedido_producto_tablets` as pp " +
      "INNER JOIN product_tablets as p ON pp.idProducto = p.id " +
      "WHERE idPedido = ?",
    [id],
    function selectOrden(err, results, fields) {
      if (err) {
        console.error("DB error GET /pedido/:pedidoId:", err);
        return res
          .status(500)
          .json({ ok: false, error: "DB_ERROR", message: err.message });
      }
      return res.status(200).json({ data: results });
    },
  );
});

// POST: procesar pedido (cambia estado y devuelve productos)
router.post("/procesar", (req, res, next) => {
  const pedidoId = req.body.values.idPedido;

  db.query(
    "UPDATE pedido_tablets SET estado = 'procesado' WHERE idPedido = ?",
    [pedidoId],
    function updateEstado(err, results, fields) {
      if (err) {
        console.error("DB error POST /pedido/procesar (update):", err);
        return res
          .status(500)
          .json({ ok: false, error: "DB_ERROR", message: err.message });
      }

      db.query(
        "SELECT pp.idProducto, pp.precio as 'precioOrden', pp.color, p.* " +
          "FROM `pedido_producto_tablets` as pp " +
          "INNER JOIN product_tablets as p ON pp.idProducto = p.id " +
          "WHERE idPedido = ?",
        [pedidoId],
        function selectOrden(err2, results2, fields2) {
          if (err2) {
            console.error("DB error POST /pedido/procesar (select):", err2);
            return res
              .status(500)
              .json({ ok: false, error: "DB_ERROR", message: err2.message });
          }
          return res.status(200).json({ data: results2 });
        },
      );
    },
  );
});

// POST: pago (guarda parcial/total y devuelve productos)
router.post("/pago", (req, res, next) => {
  const pedidoId = req.body.values.idPedido;
  const pagoParcial = req.body.parcial;
  const pagoTotal = req.body.total;

  db.query(
    "UPDATE pedido_tablets SET pagoParcial = ?, pagoTotal = ? WHERE idPedido = ?",
    [pagoParcial, pagoTotal, pedidoId],
    function updatePago(err, results, fields) {
      if (err) {
        console.error("DB error POST /pedido/pago (update):", err);
        return res
          .status(500)
          .json({ ok: false, error: "DB_ERROR", message: err.message });
      }

      db.query(
        "SELECT pp.idProducto, pp.precio as 'precioOrden', pp.color, p.* " +
          "FROM `pedido_producto_tablets` as pp " +
          "INNER JOIN product_tablets as p ON pp.idProducto = p.id " +
          "WHERE idPedido = ?",
        [pedidoId],
        function selectOrden(err2, results2, fields2) {
          if (err2) {
            console.error("DB error POST /pedido/pago (select):", err2);
            return res
              .status(500)
              .json({ ok: false, error: "DB_ERROR", message: err2.message });
          }
          return res.status(200).json({ data: results2 });
        },
      );
    },
  );
});

// POST: cerrar (cambia estado y devuelve productos)
router.post("/cerrar", (req, res, next) => {
  const pedidoId = req.body.values.idPedido;

  db.query(
    "UPDATE pedido_tablets SET estado = 'cerrado' WHERE idPedido = ?",
    [pedidoId],
    function updateEstado(err, results, fields) {
      if (err) {
        console.error("DB error POST /pedido/cerrar (update):", err);
        return res
          .status(500)
          .json({ ok: false, error: "DB_ERROR", message: err.message });
      }

      db.query(
        "SELECT pp.idProducto, pp.precio as 'precioOrden', pp.color, p.* " +
          "FROM `pedido_producto_tablets` as pp " +
          "INNER JOIN product_tablets as p ON pp.idProducto = p.id " +
          "WHERE idPedido = ?",
        [pedidoId],
        function selectOrden(err2, results2, fields2) {
          if (err2) {
            console.error("DB error POST /pedido/cerrar (select):", err2);
            return res
              .status(500)
              .json({ ok: false, error: "DB_ERROR", message: err2.message });
          }
          return res.status(200).json({ data: results2 });
        },
      );
    },
  );
});

// POST: borrar lógico (marca borrado y devuelve productos)
router.post("/borrar", (req, res, next) => {
  const pedidoId = req.body.values.idPedido;

  db.query(
    "UPDATE pedido_tablets SET borrado = 1 WHERE idPedido = ?",
    [pedidoId],
    function updateBorrado(err, results, fields) {
      if (err) {
        console.error("DB error POST /pedido/borrar (update):", err);
        return res
          .status(500)
          .json({ ok: false, error: "DB_ERROR", message: err.message });
      }

      db.query(
        "SELECT pp.idProducto, pp.precio as 'precioOrden', pp.color, p.* " +
          "FROM `pedido_producto_tablets` as pp " +
          "INNER JOIN product_tablets as p ON pp.idProducto = p.id " +
          "WHERE idPedido = ?",
        [pedidoId],
        function selectOrden(err2, results2, fields2) {
          if (err2) {
            console.error("DB error POST /pedido/borrar (select):", err2);
            return res
              .status(500)
              .json({ ok: false, error: "DB_ERROR", message: err2.message });
          }
          return res.status(200).json({ data: results2 });
        },
      );
    },
  );
});

// POST: crear pedido + productos
router.post("/", (req, res, next) => {
  const pedido = {
    usuarioId: req.body.values.usuarioId,
    numeroVoucher: req.body.values.numero_voucher,
    idRecetaGraduacion: req.body.values.idRecetaGraduacion,
    idTipoLente: req.body.values.idTipoLente,
    precioLente: req.body.values.precioTipoLente,
    antireflejo: req.body.values.antireflejo,
    precioAntireflejo: req.body.values.precioAntireflejo,
    infoAdicional: req.body.values.infoAdicional,
    fotocromatico: req.body.values.fotocromatico,
    precioFotocromatico: req.body.values.precioFotocromatico,
    idMarco: req.body.values.idMarco,
    precioMarco: req.body.values.precioMarco,
    total: req.body.values.total,
    color: req.body.values.color,
    recetaImage: req.body.values.recetaImage,
  };

  db.query(
    "INSERT INTO `pedido_tablets`(`idUsuario`, `fechaIngreso`, `estado`,`idRecetaGraduacion`,`total`,`numeroVoucher`,`urlReceta`,`info`) " +
      "VALUES (?,NOW(),'nueva',?,?,?,?,?)",
    [
      pedido.usuarioId,
      pedido.idRecetaGraduacion,
      pedido.total,
      pedido.numeroVoucher,
      pedido.recetaImage,
      pedido.infoAdicional,
    ],
    function addPedido(err, results, fields) {
      if (err) {
        console.error("DB error INSERT pedido:", err);
        return res
          .status(500)
          .json({ ok: false, error: "DB_ERROR", message: err.message });
      }

      if (!results || typeof results.insertId === "undefined") {
        console.error("DB error INSERT pedido: sin insertId", results);
        return res.status(500).json({ ok: false, error: "DB_NO_INSERT_ID" });
      }

      const pedidoId = results.insertId;

      // Inserts relacionados: loguean errores pero no rompen la request
      db.query(
        "INSERT INTO `pedido_producto_tablets`(`idPedido`, `idProducto`, `precio`, `color`) VALUES (?,?,?,?)",
        [pedidoId, pedido.idMarco, pedido.precioMarco, pedido.color],
        function addPedidoProducto(err2) {
          if (err2)
            console.error("DB error INSERT pedido_producto_tablets (marco):", err2);
        },
      );

      db.query(
        "INSERT INTO `pedido_producto_tablets`(`idPedido`, `idProducto`, `precio`) VALUES (?,?,?)",
        [pedidoId, pedido.idTipoLente, pedido.precioLente],
        function addPedidoProducto(err2) {
          if (err2)
            console.error("DB error INSERT pedido_producto_tablets (lente):", err2);
        },
      );

      if (pedido.antireflejo !== "") {
        db.query(
          "INSERT INTO `pedido_producto_tablets`(`idPedido`, `idProducto`, `precio`) VALUES (?,?,?)",
          [pedidoId, pedido.antireflejo, pedido.precioAntireflejo],
          function addPedidoProducto(err2) {
            if (err2)
              console.error(
                "DB error INSERT pedido_producto_tablets (antireflejo):",
                err2,
              );
          },
        );
      }

      if (pedido.fotocromatico !== "") {
        db.query(
          "INSERT INTO `pedido_producto_tablets`(`idPedido`, `idProducto`, `precio`) VALUES (?,?,?)",
          [pedidoId, pedido.fotocromatico, pedido.precioFotocromatico],
          function addPedidoProducto(err2) {
            if (err2)
              console.error(
                "DB error INSERT pedido_producto_tablets (fotocromatico):",
                err2,
              );
          },
        );
      }

      return res
        .status(200)
        .json({ ok: true, pedidoId: pedidoId, data: results });
    },
  );
});

// POST: pago MercadoPago
router.post("/pagoMP", (req, res, next) => {
  const pedidoId = req.body.values.idPedido;
  const pagoParcial = req.body.values.parcial;
  const pagoTotal = req.body.values.total;

  const payment_id = req.body.values.payment_id;
  const payment_type = req.body.values.payment_type;
  const merchant_order_id = req.body.values.merchant_order_id;
  const preference_id = req.body.values.preference_id;

  const sede = req.body.values.sede;

  db.query(
    "UPDATE pedido_tablets " +
      "SET pagoParcial = ?, pagoTotal = ?, estado = 'pagado', " +
      "mp_preference_id = ?, mp_merchant_order_id = ?, mp_payment_id = ?, mp_payment_type = ?, sede = ? " +
      "WHERE idPedido = ?",
    [
      pagoParcial,
      pagoTotal,
      preference_id,
      merchant_order_id,
      payment_id,
      payment_type,
      sede,
      pedidoId,
    ],
    function pagoMP(err, results, fields) {
      if (err) {
        console.error("DB error POST /pedido/pagoMP:", err);
        return res
          .status(500)
          .json({ ok: false, error: "DB_ERROR", message: err.message });
      }
      return res
        .status(200)
        .json({ data: results, idPed: pedidoId, q: preference_id });
    },
  );
});

module.exports = router;
