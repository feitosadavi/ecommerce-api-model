const router = require('express').Router();

const auth = require('../../auth');
const validate = require('../../../controllers/validacoes/validate');
const {show, store, update, remove, recoverPass, passRecovered} = require('../../../controllers/validacoes/usuarioValidation');

const UsuarioController = require('../../../controllers/UsuarioController');
const usuarioController = new UsuarioController();

router.get('/', auth.required, usuarioController.index); //index
router.get( '/:id', auth.required, validate(show), usuarioController.show); //show

router.post( '/login', usuarioController.login); //login
router.post( '/criar', validate(store),usuarioController.store); //store
router.put( '/editar', auth.required, validate(update), usuarioController.update); //update
router.delete('/remover', auth.required, validate(remove), usuarioController.remove); //remove

router.get('/recuperar-senha', usuarioController.showRecovery);
router.post('/recuperar-senha', validate(recoverPass),usuarioController.createRecovery);
router.get('/senha-recuperada', usuarioController.showCompleteRecovery);
router.post('/senha-recuperada', validate(passRecovered), usuarioController.completeRecovery);

module.exports = router;
