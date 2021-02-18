const router = require('express').Router();
//VALIDAÇÃO NÃO COMPLETA
const auth = require('../../auth');
const {admin} = require('../../../controllers/validacoes/lojaValidation');
const validate = require('../../../controllers/validacoes/validate');
const {index, show, store, update, remove, showAdmin, updateAdmin, showPedidosCliente, search} = require('../../../controllers/validacoes/clienteValidation');

const ClienteController = require('../../../controllers/ClienteController');
const clienteController = new ClienteController();

// ADMIN
router.get('/', auth.required, admin, validate(index), clienteController.index); //index

router.get( '/search/:search/pedidos', auth.required, admin, validate(search), clienteController.searchPedidos); //FALTATESTE
router.get( '/search/:search', auth.required, admin, validate(search), clienteController.search); //search

router.get( '/admin/:id', auth.required, admin, validate(showAdmin), clienteController.showAdmin);//showAdmin
router.get( '/admin/:id/pedidos', auth.required, admin, validate(showPedidosCliente), clienteController.showPedidosClientes);//FALTATESTE
router.put( '/admin/:id', auth.required, admin, validate(updateAdmin), clienteController.updateAdmin);


// CLIENTE
router.get('/:id', auth.required, validate(show), clienteController.show);//show

router.post('/criar', auth.optional, validate(store), clienteController.store);//store
router.put('/:id', auth.required, validate(update), clienteController.update);//update
router.delete('/:id', auth.required, validate(remove), clienteController.remove);//remove

module.exports = router;
