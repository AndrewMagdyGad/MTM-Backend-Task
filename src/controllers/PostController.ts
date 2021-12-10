import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import Joi from 'joi'
import { User } from '../entities/User'
import { Post } from '../entities/Post'
import { Comment } from '../entities/Comment'

export default class PostController {
  static likePost = async (req: Request, res: Response) => {
    try {
      const id = res.locals.jwtPayload.userId
      const userRepository = getRepository(User)
      let user: User = await userRepository.findOneOrFail(id)
      if (!user) {
        res.status(400).send('There is no defined user')
        return
      }

      const postId = req.params.id
      const postRepository = getRepository(Post)
      const post: Post = await postRepository.findOneOrFail(postId, { relations: ['likes'] })
      if (!post) {
        res.status(400).send('There is no defined post')
        return
      }

      const checkPosts = post.likes.filter((user: User) => user.id === id)
      if (checkPosts.length === 0) {
        post.likes = [...post.likes, user]
        const result = await postRepository.save(post)
        res.status(200).send(result)
      } else {
        res.status(400).send('This post is already liked by this user')
      }
    } catch (e) {
      res.status(400).send(e)
    }
  }

  static unlikePost = async (req: Request, res: Response) => {
    try {
      const id = res.locals.jwtPayload.userId
      const userRepository = getRepository(User)
      let user: User = await userRepository.findOneOrFail(id)
      if (!user) {
        res.status(400).send('There is no defined user')
        return
      }

      const postId = req.params.id
      const postRepository = getRepository(Post)
      const post: Post = await postRepository.findOneOrFail(postId, { relations: ['likes'] })
      if (!post) {
        res.status(400).send('There is no defined post')
        return
      }

      post.likes = post.likes.filter((user: User) => user.id != id)
      const result = await postRepository.save(post)
      res.status(200).send(result)
    } catch (e) {
      res.status(400).send(e)
    }
  }

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

      const postRepository = getRepository(Post)
      const posts = await postRepository.find({
        relations: ['author', 'likes'],
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
        order: { createdAt: 'ASC' }
      })
      res.status(200).send(posts)
    } catch (e) {
      res.status(400).send(e)
    }
  }

  static getPostById = async (req: Request, res: Response) => {
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

      const postId = req.params.id
      const postRepository = getRepository(Post)
      const post: Post = await postRepository.findOneOrFail(postId, {
        relations: ['author', 'likes']
      })
      if (!post) {
        res.status(400).send('There is no defined post')
        return
      }

      const commentRepository = getRepository(Comment)
      const comments = await commentRepository.find({
        relations: ['author'],
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
        order: { createdAt: 'ASC' },
        where: [{ post: { id: postId } }]
      })
      res.status(200).send({ post, comments })
    } catch (e) {
      res.status(400).send(e)
    }
  }

  static addPost = async (req: Request, res: Response) => {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required()
    })

    const { error } = schema.validate(req.body)
    if (error) {
      res.status(400).send(error)
    } else {
      const id = res.locals.jwtPayload.userId
      const userRepository = getRepository(User)
      let user: User = await userRepository.findOneOrFail(id)

      if (!user) {
        res.status(400).send('There is no defined user')
        return
      }

      let post: Post = new Post()
      post.title = req.body.title
      post.description = req.body.description
      post.author = user

      const postRepository = getRepository(Post)
      const result = await postRepository
        .save(post)
        .catch((e: { detail: string }) => res.status(400).send(e.detail))
      res.status(201).send(result)
    }
  }

  static updatePost = async (req: Request, res: Response) => {
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

      const postId = req.params.id
      const postRepository = getRepository(Post)
      const post = await postRepository.findOneOrFail(postId)

      if (!post) {
        res.status(400).send(`There is no post for thie id: ${postId}`)
        return
      }

      post.title = req.body.title
      post.description = req.body.description

      const result = await postRepository
        .save(post)
        .catch((e: { detail: string }) => res.status(400).send(e.detail))
      res.status(200).send(result)
    } catch (e) {
      res.status(400).send(e)
    }
  }

  static deletePost = async (req: Request, res: Response) => {
    try {
      const id = res.locals.jwtPayload.userId
      const userRepository = getRepository(User)
      let user: User = await userRepository.findOneOrFail(id)
      if (!user) {
        res.status(400).send('There is no defined user')
        return
      }

      const postId = req.params.id
      const postRepository = getRepository(Post)
      const post = await postRepository.findOneOrFail(postId, { relations: ['author'] })
      if (!post) {
        res.status(400).send(`There is no post for thie id: ${postId}`)
        return
      }

      if (post.author.id != user.id) {
        res.status(400).send('Denied, this user is not the author of this post')
        return
      }

      const commentRepository = getRepository(Comment)
      await commentRepository.delete({ post: { id: postId } })

      const result = await postRepository.delete(post.id)
      res.status(200).send(result)
    } catch (e) {
      res.status(400).send(e)
    }
  }
}
