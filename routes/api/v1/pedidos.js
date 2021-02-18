const router = require('express').Router();

const validate = require('../../../controllers/validacoes/validate');
const auth = require('../../auth');
const {validateURLparams, validateURL, validateURLindex, store} = require('../../../controllers/validacoes/pedidosValidation');
const {admin} = require('../../../controllers/validacoes/lojaValidation');

const PedidosController = require('../../../controllers/PedidosController');
const pedidosController = new PedidosController;

//CHECAR AS VALIDAÇÕES
//ADMIN
router.get('/admin', auth.required, admin, validate(validateURLindex), pedidosController.indexAdmin);//testado
router.get('/admin/:id', auth.required, admin, validate(validateURL), pedidosController.showAdmin);//testado

router.delete('/admin/remover/:id', auth.required, admin, validate(validateURL), pedidosController.removeAdmin);//testado

// -- carrinho
router.get('/admin/:id/carrinho', auth.required, admin, validate(validateURL), pedidosController.showClienteCarrinhoAdmin);//testado

// --entrega

// -- pagamento


//CLIENTE
router.get('/', auth.required, validate(validateURLindex), pedidosController.index);//testado
router.get('/:id', auth.required, validate(validateURL), pedidosController.show);//testado
router.get('/:id/carrinho', auth.required, validate(validateURL), pedidosController.showCarrinho);//testado

router.post('/enviar', auth.required, validate(store), pedidosController.store);//testado
router.delete('/remover/:id', auth.required, validate(validateURLparams), pedidosController.remove);//testado

module.exports = router;