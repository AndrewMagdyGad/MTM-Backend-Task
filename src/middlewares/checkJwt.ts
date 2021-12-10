import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import Environment from '../bootstrap/environment'

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwtSecret = String(Environment.getConfig().jwtSecret)
    //Get the jwt token from the head
    const headers = <string>req.get('Authorization')
    if (headers) {
      const bearer = headers.split(' ')[0].toLowerCase()
      const token = headers.split(' ')[1]
      if (token && bearer === 'bearer') {
        let jwtPayload

        //Try to validate the token and get data
        try {
          jwtPayload = <any>jwt.verify(token, jwtSecret)
          res.locals.jwtPayload = jwtPayload
          //Call the next middleware or controller
          next()
          return
        } catch (error) {
          //If token is not valid, respond with 401 (unauthorized)
          throw new Error('Login Error, Please login again')
        }
      }
    }
    throw new Error('Login Error, Please login again')
  } catch (error) {
    let parsedError = JSON.parse(JSON.stringify(error))
    let message = 'Login Error, Please login again'
    if (parsedError.name === 'TokenExpiredError')
      message = 'Token Expired Error, Please login again'
    res.status(401).send({
      status: 'error',
      message
    })
    return
  }
}
