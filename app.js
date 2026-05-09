const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
/* Totems */
const productRoutes = require("./api/routes/products");
const loginRoutes = require("./api/routes/login");
const usuarioRoutes = require("./api/routes/usuario");
const graduacionRoutes = require("./api/routes/graduacion");
const pedidoRoutes = require("./api/routes/pedido");
/* Tables */
const productRoutesTablets = require("./api/routes/tablets/products");
const loginRoutesTablets = require("./api/routes/tablets/login");
const usuarioRoutesTablets = require("./api/routes/tablets/usuario");
const graduacionRoutesTablets = require("./api/routes/tablets/graduacion");
const pedidoRoutesTablets = require("./api/routes/tablets/pedido");
const pagosRoutesTablets = require("./api/routes/tablets/pagos");
const recetasRoutesTablets = require("./api/routes/tablets/recetas");
const recetas2RoutesTablets = require("./api/routes/tablets/recetas2");

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false, limit: "20mb" }));
app.use(bodyParser.json({ limit: "20mb" }));

// Add headers
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);
  // Pass to next layer of middleware
  next();
});

/* Totems */
app.use("/products", productRoutes);
app.use("/login", loginRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/graduacion", graduacionRoutes);
app.use("/pedido", pedidoRoutes);
/* Tables */
app.use("/tablets/products", productRoutesTablets);
app.use("/tablets/login", loginRoutesTablets);
app.use("/tablets/usuario", usuarioRoutesTablets);
app.use("/tablets/graduacion", graduacionRoutesTablets);
app.use("/tablets/pedido", pedidoRoutesTablets);
app.use("/tablets/pagos", pagosRoutesTablets);
app.use("/tablets/recetas", recetasRoutesTablets);
app.use("/tablets/recetas2", recetas2RoutesTablets);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
