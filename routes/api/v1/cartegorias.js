const router = require('express').Router();

const auth = require('../../auth');
const validate = require('../../../controllers/validacoes/validate');
const {admin} = require('../../../controllers/validacoes/lojaValidation');
const {index ,indexDisponiveis, show, store, update} = require('../../../controllers/validacoes/cartegoriasValidation');

const CartegoriaController = require('../../../controllers/CartegoriaController');
const cartegoriaController = new CartegoriaController;

//TODOS OS USUARIOS
router.get('/', validate(index), cartegoriaController.index);
router.get('/disponiveis', validate(index), cartegoriaController.indexDisponiveis);
router.get('/:id', validate(indexDisponiveis), cartegoriaController.show);

//ADMIN
router.post('/criar', auth.required, admin, validate(store), cartegoriaController.store);
router.put('/editar/:id', auth.required, admin, validate(update), cartegoriaController.update);
router.delete('/remover/:id', auth.required, admin, validate(update),cartegoriaController.delete);

//ROTAS AO PRODUTO
router.get('/:id/produtos', cartegoriaController.showProdutos);//falta validar e testar
router.put('/:id/produtos', auth.required, admin, cartegoriaController.updateProdutos);//falta validar e testar

module.exports = router;