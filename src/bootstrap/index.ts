import Server from './server'
import { Database } from './database'
export default class Bootstrap {
  public static initServer() {
    Server.init()
  }

  public static initDatabase() {
    Database.connect()
  }
}
