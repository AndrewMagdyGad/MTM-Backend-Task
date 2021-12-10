import { Application } from 'express'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

interface IConfig {
  port: string | undefined
  dbType: string | undefined
  dbHost: string | undefined
  dbPort: string | undefined
  dbName: string | undefined
  dbUser: string | undefined
  dbPassword: string | undefined
  jwtSecret: string | undefined
  bigquery_dataset: string | undefined
  bigquery_table: string | undefined
}

export default class Environment {
  public static getConfig(): IConfig {
    const port = process.env.PORT
    const dbType = process.env.DB_TYPE
    const dbHost = process.env.DB_HOST
    const dbPort = process.env.DB_PORT
    const dbName = process.env.DB_NAME
    const dbUser = process.env.DB_USERNAME
    const dbPassword = process.env.DB_PASSWORD
    const jwtSecret = process.env.ACCESS_TOKEN_SECRET
    const bigquery_dataset = process.env.BIGQUERY_DATASET
    const bigquery_table = process.env.BIGQUERY_TABLE

    return {
      port,
      dbType,
      dbHost,
      dbPort,
      dbName,
      dbUser,
      dbPassword,
      jwtSecret,
      bigquery_dataset,
      bigquery_table
    }
  }

  public init(express: Application): Application {
    express.locals.app = Environment.getConfig()
    return express
  }
}
