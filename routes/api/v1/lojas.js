const router = require('express').Router();

const auth = require('../../auth');
const validate = require('../../../controllers/validacoes/validate');
const { admin, index, show, store, update, remove} = require('../../../controllers/validacoes/lojaValidation');

const LojaController = require('../../../controllers/LojaController');
const lojaController = new LojaController();

router.get('/', validate(index), lojaController.index);
router.get( '/:id', auth.required, admin, validate(show), lojaController.show);

router.post( '/', auth.required, validate(store), lojaController.store);
router.put( '/:id', auth.required, admin, validate(update), lojaController.update);
router.delete( '/:id', auth.required, admin, validate(remove), lojaController.remove);

module.exports = router;
