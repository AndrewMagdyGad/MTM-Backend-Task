import { Router } from 'express'
import CommentController from '../../controllers/CommentController'
import { checkJwt } from '../../middlewares/checkJwt'
import { checkRole } from '../../middlewares/checkRole'

const router = Router()

router.post('/new', [checkJwt, checkRole(['USER'])], CommentController.addComment)
router.patch('/:id', [checkJwt, checkRole(['USER'])], CommentController.updateComment)
router.delete('/:id', [checkJwt, checkRole(['USER'])], CommentController.deleteComment)
router.get('/all', [checkJwt, checkRole(['USER'])], CommentController.listAll)

export default router
