import { Router } from 'express'
import AuthController from '../../controllers/AuthController'
// import { checkJwt } from '../../middlewares/checkJwt'

const router = Router()
router.post('/signup', AuthController.signup)
router.post('/login', AuthController.login)

export default router
