import { Request, Response } from 'express'
import Joi from 'joi'
import { getRepository } from 'typeorm'
import { User } from '../entities/User'
import { Post } from '../entities/Post'
import { Comment } from '../entities/Comment'

export default class CommentController {
  static listAll = async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined
      const itemsPerPage = req.query.itemsPerPage ? Number(req.query.itemsPerPage) : undefined

      if (!page || !itemsPerPage) {
        res.status(400).send('page and itemsPerPage are mandatory fields')
        return
      }

      if (page <= 0 || itemsPerPage <= 0) {
        res.status(400).send('page and itemsPerPage should be positive integer values')
        return
      }

      const userId = res.locals.jwtPayload.userId
      const commentRepository = getRepository(Comment)
      const comments = await commentRepository.find({
        relations: ['author', 'post'],
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
        order: { createdAt: 'ASC' },
        where: [{ author: { id: userId } }]
      })
      res.status(200).send(comments)
    } catch (e) {
      res.status(400).send(e)
    }
  }

  static addComment = async (req: Request, res: Response) => {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      postId: Joi.string().required()
    })

    const { error } = schema.validate(req.body)
    if (error) {
      res.status(400).send(error)
      return
    }

    try {
      const id = res.locals.jwtPayload.userId
      const userRepository = getRepository(User)
      let user: User = await userRepository.findOneOrFail(id)
      if (!user) {
        res.status(400).send('There is no defined user')
        return
      }

      const postRepository = getRepository(Post)
      const post = await postRepository.findOneOrFail(req.body.postId)
      if (!post) {
        res.status(400).send('There is no post for this id')
        return
      }

      let comment: Comment = new Comment()
      comment.title = req.body.title
      comment.description = req.body.description
      comment.author = user
      comment.post = post

      const commentRepository = getRepository(Comment)
      const result = await commentRepository
        .save(comment)
        .catch((e: { detail: string }) => res.status(400).send(e.detail))

      res.status(201).send(result)
    } catch (e) {
      res.status(400).send(e)
    }
  }

  static updateComment = async (req: Request, res: Response) => {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required()
    })

    const { error } = schema.validate(req.body)
    if (error) {
      res.status(400).send(error)
      return
    }

    try {
      const id = res.locals.jwtPayload.userId
      const userRepository = getRepository(User)
      let user: User = await userRepository.findOneOrFail(id)
      if (!user) {
        res.status(400).send('There is no defined user')
        return
      }

      const commentId = req.params.id
      const commentRepository = getRepository(Comment)
      const comment = await commentRepository.findOneOrFail(commentId, { relations: ['author'] })
      if (!comment) {
        res.status(400).send('There is no comment for this id')
        return
      }
      console.log('Comment: ', comment)

      if (comment.author.id != user.id) {
        res.status(400).send('This comment belongs to another user')
        return
      }

      comment.title = req.body.title
      comment.description = req.body.description
      const result = await commentRepository.save(comment)

      res.status(201).send(result)
    } catch (e) {
      res.status(400).send(e)
    }
  }

  static deleteComment = async (req: Request, res: Response) => {
    try {
      const id = res.locals.jwtPayload.userId
      const userRepository = getRepository(User)
      let user: User = await userRepository.findOneOrFail(id)
      if (!user) {
        res.status(400).send('There is no defined user')
        return
      }

      const commentId = req.params.id
      const commentRepository = getRepository(Comment)
      const comment = await commentRepository.findOneOrFail(commentId, { relations: ['author'] })
      if (!comment) {
        res.status(400).send('There is no comment for this id')
        return
      }

      if (comment.author.id != user.id) {
        res.status(400).send('This comment belongs to another user')
        return
      }

      const result = await commentRepository.delete(commentId)
      res.status(200).send(result)
    } catch (e) {
      res.status(400).send(e)
    }
  }
}
