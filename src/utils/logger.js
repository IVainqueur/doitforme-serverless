// import pino from 'pino'
// export const logger = pino({
//   transport: {
//     target: 'pino-pretty'
//   },
// })
import pino from 'pino'
import pretty from 'pino-pretty'
const stream = pretty({
  colorize: true
})
export const logger = pino({ level: 'info' }, stream)