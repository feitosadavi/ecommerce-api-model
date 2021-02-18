const router = require('express').Router();

const auth = require('../../auth');
const validate = require('../../../controllers/validacoes/validate');
const {validateURL, store, update, index} = require('../../../controllers/validacoes/variacoesValidation');
const {admin} = require('../../../controllers/validacoes/lojaValidation');
const upload = require('../../../config/multer');

const VariacaoController = require('../../../controllers/VariacaoController');
const variacaoController = new VariacaoController();
//CLIENTE
router.get('/', validate(index), variacaoController.index);//testado
router.get('/:id', validate(validateURL), variacaoController.show);//testado

//ADMIN
router.post('/criar', auth.required, admin, validate(store), variacaoController.store);//testado
router.put('/editar/:id', auth.required, admin, validate(update), variacaoController.update);//testado
router.put('/imagens/:id', auth.required, admin, validate(validateURL), upload.array("files", 4), variacaoController.updateImagens);//testado
router.delete('/remover/:id', auth.required, admin, validate(validateURL), variacaoController.remove);//testado

module.exports = router;