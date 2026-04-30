const express = require("express");
const router = express.Router();
const db = require("../../config/db-totem");

router.get("/", (req, res, next) => {
  db.query(
    "SELECT * FROM pedido " +
      "INNER JOIN usuarioAfiliado ON pedido.idUsuario = usuarioAfiliado.id " +
      "WHERE borrado = 0",
    function (err, results) {
      if (err) {
        console.error("DB error GET /pedido:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

router.get("/:pedidoId", (req, res, next) => {
  const id = req.params.pedidoId;
  db.query(
    "SELECT pp.idProducto, pp.precio as 'precioOrden', pp.color, p.* FROM `pedido-producto` as pp " +
      "INNER JOIN product as p ON pp.idProducto = p.id " +
      "WHERE idPedido = ?",
    [id],
    function (err, results) {
      if (err) {
        console.error("DB error GET /pedido/:id:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ data: results });
    }
  );
});

router.post("/procesar", (req, res, next) => {
  const pedidoId = req.body.values.idPedido;
  db.query(
    "UPDATE pedido SET estado = 'procesado' WHERE idPedido = ?",
    [pedidoId],
    function (err) {
      if (err) {
        console.error("DB error POST /pedido/procesar (update):", err);
        return res.status(500).json({ error: err.message });
      }
      db.query(
        "SELECT pp.idProducto, pp.precio as 'precioOrden', pp.color, p.* FROM `pedido-producto` as pp " +
          "INNER JOIN product as p ON pp.idProducto = p.id " +
          "WHERE idPedido = ?",
        [pedidoId],
        function (err2, results2) {
          if (err2) {
            console.error("DB error POST /pedido/procesar (select):", err2);
            return res.status(500).json({ error: err2.message });
          }
          return res.status(200).json({ data: results2 });
        }
      );
    }
  );
});

router.post("/pago", (req, res, next) => {
  const pedidoId = req.body.values.idPedido;
  const pagoParcial = req.body.parcial;
  const pagoTotal = req.body.total;

  db.query(
    "UPDATE pedido SET pagoParcial = ?, pagoTotal = ? WHERE idPedido = ?",
    [pagoParcial, pagoTotal, pedidoId],
    function (err) {
      if (err) {
        console.error("DB error POST /pedido/pago (update):", err);
        return res.status(500).json({ error: err.message });
      }
      db.query(
        "SELECT pp.idProducto, pp.precio as 'precioOrden', pp.color, p.* FROM `pedido-producto` as pp " +
          "INNER JOIN product as p ON pp.idProducto = p.id " +
          "WHERE idPedido = ?",
        [pedidoId],
        function (err2, results2) {
          if (err2) {
            console.error("DB error POST /pedido/pago (select):", err2);
            return res.status(500).json({ error: err2.message });
          }
          return res.status(200).json({ data: results2 });
        }
      );
    }
  );
});

router.post("/cerrar", (req, res, next) => {
  const pedidoId = req.body.values.idPedido;
  db.query(
    "UPDATE pedido SET estado = 'cerrado' WHERE idPedido = ?",
    [pedidoId],
    function (err) {
      if (err) {
        console.error("DB error POST /pedido/cerrar (update):", err);
        return res.status(500).json({ error: err.message });
      }
      db.query(
        "SELECT pp.idProducto, pp.precio as 'precioOrden', pp.color, p.* FROM `pedido-producto` as pp " +
          "INNER JOIN product as p ON pp.idProducto = p.id " +
          "WHERE idPedido = ?",
        [pedidoId],
        function (err2, results2) {
          if (err2) {
            console.error("DB error POST /pedido/cerrar (select):", err2);
            return res.status(500).json({ error: err2.message });
          }
          return res.status(200).json({ data: results2 });
        }
      );
    }
  );
});

router.post("/borrar", (req, res, next) => {
  const pedidoId = req.body.values.idPedido;
  db.query(
    "UPDATE pedido SET borrado = 1 WHERE idPedido = ?",
    [pedidoId],
    function (err) {
      if (err) {
        console.error("DB error POST /pedido/borrar (update):", err);
        return res.status(500).json({ error: err.message });
      }
      db.query(
        "SELECT pp.idProducto, pp.precio as 'precioOrden', pp.color, p.* FROM `pedido-producto` as pp " +
          "INNER JOIN product as p ON pp.idProducto = p.id " +
          "WHERE idPedido = ?",
        [pedidoId],
        function (err2, results2) {
          if (err2) {
            console.error("DB error POST /pedido/borrar (select):", err2);
            return res.status(500).json({ error: err2.message });
          }
          return res.status(200).json({ data: results2 });
        }
      );
    }
  );
});

router.post("/", (req, res, next) => {
  const pedido = {
    usuarioId: req.body.values.usuarioId,
    numeroVoucher: req.body.values.numero_voucher,
    idRecetaGraduacion: req.body.values.idRecetaGraduacion,
    idTipoLente: req.body.values.idTipoLente,
    sede: req.body.values.sede,
    infoAdicional: req.body.values.infoAdicional,
    precioLente: req.body.values.precioTipoLente,
    antireflejo: req.body.values.antireflejo,
    precioAntireflejo: req.body.values.precioAntireflejo,
    fotocromatico: req.body.values.fotocromatico,
    precioFotocromatico: req.body.values.precioFotocromatico,
    idMarco: req.body.values.idMarco,
    precioMarco: req.body.values.precioMarco,
    total: req.body.values.total,
    color: req.body.values.color,
  };

  db.query(
    "INSERT INTO `pedido`(`idUsuario`, `fechaIngreso`, `estado`, `idRecetaGraduacion`, `total`, `numeroVoucher`, `sede`, `info`) VALUES (?, (NOW() - INTERVAL 3 HOUR), 'nueva', ?, ?, ?, ?, ?)",
    [pedido.usuarioId, pedido.idRecetaGraduacion, pedido.total, pedido.numeroVoucher, pedido.sede, pedido.infoAdicional],
    function (err, results) {
      if (err) {
        console.error("DB error INSERT pedido:", err);
        return res.status(500).json({ error: err.message });
      }

      if (!results || typeof results.insertId === "undefined") {
        console.error("DB error INSERT pedido: sin insertId", results);
        return res.status(500).json({ error: "DB_NO_INSERT_ID" });
      }

      const pedidoId = results.insertId;

      db.query(
        "INSERT INTO `pedido-producto`(`idPedido`, `idProducto`, `precio`, `color`) VALUES (?,?,?,?)",
        [pedidoId, pedido.idMarco, pedido.precioMarco, pedido.color],
        function (err2) {
          if (err2) console.error("DB error INSERT pedido-producto (marco):", err2);
        }
      );

      db.query(
        "INSERT INTO `pedido-producto`(`idPedido`, `idProducto`, `precio`) VALUES (?,?,?)",
        [pedidoId, pedido.idTipoLente, pedido.precioLente],
        function (err2) {
          if (err2) console.error("DB error INSERT pedido-producto (lente):", err2);
        }
      );

      if (pedido.antireflejo !== "") {
        db.query(
          "INSERT INTO `pedido-producto`(`idPedido`, `idProducto`, `precio`) VALUES (?,?,?)",
          [pedidoId, pedido.antireflejo, pedido.precioAntireflejo],
          function (err2) {
            if (err2) console.error("DB error INSERT pedido-producto (antireflejo):", err2);
          }
        );
      }

      if (pedido.fotocromatico !== "") {
        db.query(
          "INSERT INTO `pedido-producto`(`idPedido`, `idProducto`, `precio`) VALUES (?,?,?)",
          [pedidoId, pedido.fotocromatico, pedido.precioFotocromatico],
          function (err2) {
            if (err2) console.error("DB error INSERT pedido-producto (fotocromatico):", err2);
          }
        );
      }

      return res.status(200).json({ ok: true, pedidoId: pedidoId, data: results });
    }
  );
});

module.exports = router;
