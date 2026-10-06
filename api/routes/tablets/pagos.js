const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const db = require("../../../config/db-totem");

const FRONTEND_BASE =
  process.env.FRONTEND_BASE || "https://boxvision-c0bda.web.app";
const SERVER_BASE =
  process.env.SERVER_BASE ||
  "https://boxvision-server-756249641463.us-central1.run.app";

function mpClient() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
}

// GET: crea preferencia de pago en MercadoPago
// (reemplaza public/tablets/pagos/index.php)
router.get("/", async (req, res, next) => {
  const impo = req.query.impo;
  const idOpe = req.query.idOpe;

  // Caso "sin precio": devolver URL de éxito directa
  if (impo === undefined || impo === "0" || impo === 0) {
    return res.json({
      url:
        FRONTEND_BASE +
        "/tablets/facetracking/?resope=1&idope=" +
        (idOpe || "") +
        "&total=" +
        (impo || "") +
        "&status=approved&payment_id=-&payment_type=-" +
        "&merchant_order_id=-&preference_id=-",
      error: "noprice",
    });
  }

  if (idOpe === undefined) {
    return res.status(403).end();
  }

  const cleanImp = String(impo).replace("$ ", "").replace(",00", "");

  try {
    const preference = new Preference(mpClient());
    const result = await preference.create({
      body: {
        items: [
          {
            title: "Orden de compra Boxvision: " + idOpe,
            quantity: 1,
            unit_price: Number(cleanImp),
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success:
            FRONTEND_BASE +
            "/tablets/facetracking/?resope=1&idope=" +
            idOpe +
            "&total=" +
            impo,
          pending:
            FRONTEND_BASE +
            "/tablets/facetracking/?resope=2&idope=" +
            idOpe +
            "&total=" +
            impo,
          failure:
            FRONTEND_BASE +
            "/tablets/facetracking/?resope=3&idope=" +
            idOpe +
            "&total=" +
            impo,
        },
        payment_methods: {
          excluded_payment_methods: [{ id: "master" }],
          excluded_payment_types: [{ id: "ticket" }],
          installments: 12,
        },
        auto_return: "all",
        // Permite que el webhook asocie el pago al pedido aunque el
        // comprador nunca vuelva a la back_url (pago desde el QR en el celular)
        external_reference: String(idOpe),
        notification_url: SERVER_BASE + "/tablets/pagos/webhook",
      },
    });

    // Guardamos la preferencia ya al crearla: el objeto Payment no la incluye
    db.query(
      "UPDATE pedido_tablets SET mp_preference_id = ? WHERE idPedido = ?",
      [result.id, idOpe],
      function savePreference(err) {
        if (err) console.error("DB error saving mp_preference_id:", err);
      },
    );

    return res.json({ url: result.init_point });
  } catch (err) {
    console.error("MercadoPago preference create failed:", err);
    return res
      .status(500)
      .json({ ok: false, error: "MP_ERROR", message: err.message });
  }
});

// POST: notificaciones de MercadoPago (webhook / IPN)
// Webhook: ?data.id=123&type=payment  body {type:"payment", data:{id:"123"}}
// IPN:     ?topic=payment&id=123
router.post("/webhook", async (req, res, next) => {
  const body = req.body || {};
  const type = req.query.type || req.query.topic || body.type || body.topic;
  const paymentId =
    req.query["data.id"] || (body.data && body.data.id) || req.query.id;

  // Respondemos 200 a todo lo que no sea un pago (ej. merchant_order)
  // para que MercadoPago no reintente
  if (type !== "payment" || !paymentId) {
    return res.status(200).end();
  }

  let payment;
  try {
    // Consultamos el pago a la API: no confiamos en el contenido de la
    // notificacion, solo en el id
    payment = await new Payment(mpClient()).get({ id: paymentId });
  } catch (err) {
    console.error("MercadoPago payment get failed:", paymentId, err);
    // 500 => MercadoPago reintenta la notificacion mas tarde
    return res.status(500).end();
  }

  const pedidoId = payment.external_reference;
  if (payment.status !== "approved" || !pedidoId) {
    return res.status(200).end();
  }

  db.query(
    "UPDATE pedido_tablets " +
      "SET pagoParcial = ?, pagoTotal = 1, estado = 'pagado', " +
      "mp_merchant_order_id = ?, mp_payment_id = ?, mp_payment_type = ? " +
      "WHERE idPedido = ?",
    [
      payment.transaction_amount,
      payment.order ? String(payment.order.id) : null,
      String(payment.id),
      payment.payment_type_id,
      pedidoId,
    ],
    function pagoWebhook(err) {
      if (err) {
        console.error("DB error POST /pagos/webhook:", err);
        return res.status(500).end();
      }
      return res.status(200).end();
    },
  );
});

// GET: token JWT (reemplaza public/tablets/pagos/key.php)
router.get("/key", (req, res, next) => {
  try {
    const payload = {
      iss: FRONTEND_BASE + "/",
      aud: FRONTEND_BASE + "/",
      iat: 1356999524,
      nbf: 1356999524 + 300,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: "HS256",
      noTimestamp: true,
    });
    return res.json({ token: token });
  } catch (err) {
    console.error("JWT sign failed:", err);
    return res
      .status(500)
      .json({ ok: false, error: "JWT_ERROR", message: err.message });
  }
});

module.exports = router;
