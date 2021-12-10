import { Request, Response } from 'express'
import Joi from 'joi'
import * as jwt from 'jsonwebtoken'
import { getRepository } from 'typeorm'
import { validate } from 'class-validator'
import { uid } from 'rand-token'
import { User } from '../entities/User'
import Environment from '../bootstrap/environment'

class AuthController {
  static signup = async (req: Request, res: Response) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })

    const { error } = schema.validate(req.body)

    if (error) {
      res.status(400).send(error)
    } else {
      let user: User = new User()
      user.username = req.body.name
      user.email = req.body.email
      user.password = req.body.password
      user.hashPassword()
      user.role = 'USER'
      user.refreshToken = ''
      user.lastLoginDate = new Date()

      const userRepository = getRepository(User)
      const result = await userRepository
        .save(user)
        .catch((e: { detail: string }) => res.status(400).send(e.detail))
      res.status(201).send(result)
    }
  }

  static login = async (req: Request, res: Response) => {
    //Check if email and password are set
    let { email, password } = req.body
    const jwtSecret = String(Environment.getConfig().jwtSecret)
    if (!(email && password)) {
      res.status(400).send()
    }

    //Get user from database
    const userRepository = getRepository(User)
    let user: User
    try {
      user = await userRepository.findOneOrFail({ where: { email } })
      //Check if encrypted password match
      if (!user.checkIfUnEncryptedPasswordIsValid(password)) {
        res.status(401).send({
          status: 'error',
          message: 'Login Error, Please login again'
        })
        return
      }

      //Sing JWT, valid for 7 days
      const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
        expiresIn: '7d'
      })

      // Validate the new values on model, Update User
      user.lastLoginDate = new Date()
      user.refreshToken = uid(255)

      const errors = await validate(user)
      if (errors.length > 0) {
        res.status(400).send(errors)
        return
      }

      //Try to safe, if fails, that means email already in use
      try {
        await userRepository.save(user)
      } catch (e) {
        res.status(409).send({
          status: 'error',
          message: 'Login Error, Email Already in use'
        })
        return
      }

      //Send the jwt in the response
      res.send({
        status: 'success',
        user: {
          accessToken: token,
          refreshToken: user.refreshToken,
          lastLoginDate: user.lastLoginDate,
          userId: user.id,
          email: user.email,
          username: user.username,
          userRole: user.role
        },
        message: 'User Retrieved Successfully'
      })
    } catch (error) {
      res.status(401).send({
        status: 'error',
        message: 'Login Error, Please login again'
      })
    }
  }
}
export default AuthController
