import Bootstrap from './bootstrap'
async function bootstrap() {
  await Bootstrap.initDatabase()
  Bootstrap.initServer()
}
bootstrap()
