import { Router } from 'express'
import PostController from '../../controllers/PostController'
import { checkJwt } from '../../middlewares/checkJwt'
import { checkRole } from '../../middlewares/checkRole'

const router = Router()

router.post('/like/:id', [checkJwt, checkRole(['USER'])], PostController.likePost)
router.post('/unlike/:id', [checkJwt, checkRole(['USER'])], PostController.unlikePost)
router.get('/all', [checkJwt, checkRole(['USER'])], PostController.listAll)
router.get('/:id', [checkJwt, checkRole(['USER'])], PostController.getPostById)
router.post('/new', [checkJwt, checkRole(['USER'])], PostController.addPost)
router.patch('/:id', [checkJwt, checkRole(['USER'])], PostController.updatePost)
router.delete('/:id', [checkJwt, checkRole(['USER'])], PostController.deletePost)

export default router
