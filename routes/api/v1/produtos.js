const router = require('express').Router();

const auth = require('../../auth');
const validate = require('../../../controllers/validacoes/validate');
const { admin } = require('../../../controllers/validacoes/lojaValidation');
const {validateURLparams, index, show, store, update, remove, validateImgs, search} = require('../../../controllers/validacoes/produtosValidation');

const upload = require('../../../config/multer')

const ProdutosController = require('../../../controllers/ProdutosController');
const produtosController = new ProdutosController();

/**
 * ADMIN
 */
router.post('/criar', auth.required, admin, validate(store), produtosController.store);
router.put('/editar/:id', auth.required, admin, validate(update),produtosController.update);
router.put('/editar/imagens/:id', auth.required, admin, validate(validateImgs), upload.array("files", 4), produtosController.updateImages);
//Em desenvolvimento router.put('/remover/imagens/:id', auth.required, admin, validate(validateImgs), upload.array("files", 4), produtosController.removeImages);
router.delete('/remover/:id', auth.required, admin, validate(remove), produtosController.remove);

/**
 * CLIENTES/VISITANTES
 */
router.get('/', validate(index), produtosController.index);
router.get('/disponiveis', produtosController.indexDisponiveis);
router.get('/seach/:search', validate(search), produtosController.search);
router.get('/:id', validate(show), produtosController.show);

//AVALIAÇÕES
router.get('/:id/avaliacoes', validate(validateURLparams), produtosController.showAvaliacoes);//Faltou validar

//VARIAÇÕES
router.get('/:id/variacoes', validate(validateURLparams), produtosController.showVariacoes);//Faltou validar

module.exports = router;