const router = require('express').Router();

const auth = require('../../auth');
const {admin} = require('../../../controllers/validacoes/lojaValidation');
const validate = require('../../../controllers/validacoes/validate');
const { show, pagar, update } = require('../../../controllers/validacoes/pagamentoValidation');

const PagamentoController = require('../../../controllers/PagamentoController');
const pagamentoController = new PagamentoController();

// TESTE
if(process.env.NODE_ENV !== "production") router.get("/tokens", (req, res) => res.render("pagseguro/index"))

// PAGSEGURO
router.post("/notificacao", pagamentoController.verNotificacao);
router.get("/session", pagamentoController.getSessionId);

// CLIENTE
router.get("/:id", auth.required, validate(show), pagamentoController.show);
router.post("/pagar/:id", auth.required, validate(pagar), pagamentoController.pagar);

// ADMIN
router.put("/admin/:id", auth.required, admin, validate(update), pagamentoController.update);


module.exports = router;