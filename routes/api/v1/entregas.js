const router = require('express').Router();

const auth = require('../../auth');
const {admin} = require('../../../controllers/validacoes/lojaValidation');
const validate = require('../../../controllers/validacoes/validate');
const { show, update, calcular } = require('../../../controllers/validacoes/entregaValidation');

const EntregaController = require('../../../controllers/EntregaController');
const entregaController = new EntregaController();

router.get('/:id', auth.required, validate(show), entregaController.show);//testado
router.put('/:id', auth.required, admin, validate(update), entregaController.update);//testado
router.post('/calcular', auth.required, validate(calcular), entregaController.calcularFrete);//testado

module.exports = router;