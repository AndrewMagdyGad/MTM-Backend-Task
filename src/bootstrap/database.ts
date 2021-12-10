import 'reflect-metadata'
import { createConnection } from 'typeorm'
import Environment from './environment'
import { User } from '../entities/User'
import { Post } from '../entities/Post'
import { Comment } from '../entities/Comment'
export class Database {
  constructor() {}
  static connect(): void {
    const { dbType, dbHost, dbPort, dbName, dbUser, dbPassword } = Environment.getConfig()
    createConnection({
      type: dbType,
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: dbPassword,
      database: dbName,
      synchronize: true,
      entities: [User, Post, Comment]
    } as any)
      .then(() => {
        console.log('info', `Connection to PostgreSQL established on port ${dbPort}`)
      })
      .catch((error: Error) => {
        console.log('error : ', error)
        process.stdout.write(`error: ${error.message}`)
        process.exit(1)
      })
  }
}
