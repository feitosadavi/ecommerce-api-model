const router = require('express').Router();

const auth = require('../../auth');
const {index, show, store, remove} = require('../../../controllers/validacoes/avaliacoesValidation');
const {admin} = require('../../../controllers/validacoes/lojaValidation');
const validate = require('../../../controllers/validacoes/validate');

const AvaliacoesController = require('../../../controllers/AvalicoesController');
const avaliacoesController = new AvaliacoesController;

//CLIENTES/VISITANTES
router.get('/', validate(index), avaliacoesController.index);//testada
router.get('/:id', validate(show), avaliacoesController.show);//testada
router.post('/criar', auth.required, validate(store), avaliacoesController.store);//testada

// ADMIN
router.delete('/:id', auth.required, admin, validate(remove), avaliacoesController.remove);//testada

module.exports = router;