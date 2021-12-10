import { Router } from 'express'
import auth from './api/auth'
import post from './api/post'
import comment from './api/comment'

const routes = Router()

routes.use('/auth', auth)
routes.use('/post', post)
routes.use('/comment', comment)

export default routes
