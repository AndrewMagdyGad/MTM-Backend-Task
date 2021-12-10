import express, { NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import * as path from 'path'

import Environment from './environment'
import routes from '../routes'

class Server {
  public app: express.Application

  constructor() {
    this.app = express()
  }

  public init(): any {
    const port: number = Number(Environment.getConfig().port)

    return this.app.listen(port, () => {
      this.app.use(express.urlencoded({ extended: true }))
      // middleware for json parsing
      this.app.use(express.json())
      // remove server type from response and implement recommended security practices
      this.app.disable('x-powered-by')
      // HTTP request logger middleware
      this.app.use(morgan('dev'))
      const frontendProductionOrigin: string | undefined = process.env.Front_Origin
      // allow cross origin, we only allow localhost
      const allowedOrigins = ['http://localhost:3001']
      // allow front end origin on production which is set using env variable in kubernetes
      if (!!frontendProductionOrigin) allowedOrigins.push(frontendProductionOrigin)
      const corsOptions: cors.CorsOptions = {
        origin: allowedOrigins
      }
      // Pass allowedOrigin to CORS
      this.app.use(cors(corsOptions))
      // HTTP security middleware headers
      this.app.use(helmet())
      // disable unnecessary HTTP methods (Security requirement)
      const allowedMethods = ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE']
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        if (!allowedMethods.includes(req.method))
          return res.status(405).json({
            status: 405,
            message: 'Method Not Allowed'
          })
        return next()
      })
      // Forward requests for the /users URI to our users router
      this.app.use('/api', routes)

      const docsOptions: swaggerJSDoc.Options = {
        definition: {
          openapi: '3.0.0',
          info: {
            description: 'This is documentation for Smart Capacity API.',
            version: '1.0.0',
            title: 'Smart Capacity Fixed',
            contact: {
              email: 'mohamed.elzanaty3@vodafone.com'
            }
          }
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        },
        apis: [path.resolve(__dirname, '../routes/api/*.js')]
      }
      const openapiSpecification = swaggerJSDoc(docsOptions)
      this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
      console.log(`Server started on port ${port}`)
    })
  }
}

export default new Server()
