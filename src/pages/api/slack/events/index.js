// Setting up the bolt app
import { App } from '@slack/bolt'
import { setupHandlers } from './_handleEvents'
import { logger } from '@/utils/logger'

export const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_TOKEN,
    port: 8080,
})

let isBoltUp = false

// this is default handle for a vercel serverless function
export default async function _handler(req, res) {
    if (req.body.type === 'pointless request') {
        logger.info('pointless')
        return res.status(200).json({ success: true })
    }
    if (req.body.type === 'url_verification') {
        logger.info('url_verification')
        return res.status(200).json({ challenge: req.body.challenge })
    }
    logger.info('sending 200')
    res.status(200).json({ success: true })
    if (!isBoltUp) {
        await app.start()
        isBoltUp = true
        logger.info('⚡️ Bolt app is running!')
        setupHandlers()
    }
    app.processEvent({
        body: req.body,
        ack: () => { },
    })

}

// this is the handler for a netlify serverless function
export const handler = async (req, context) => {
    req.body = JSON.parse(req.body)
    if (req.body.type === 'pointless') {
        logger.info('pointless request')
        return { statusCode: 200, body: JSON.stringify({ success: true }), }
    }
    if (req.body.type === 'url_verification') {
        logger.info('url_verification')
        return { statusCode: 200, body: JSON.stringify({ challenge: req.body.challenge }), }
    }
    logger.info(`--- RequestType: ${req.body.type}`)
    handleBolt(req.body)

    return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
    }
}

async function handleBolt(reqBody) {
    logger.info('handling bolt')
    if (!isBoltUp) {
        await app.start()
        isBoltUp = true
        logger.info('⚡️ Bolt app is running!')
        setupHandlers()
    }

    app.processEvent({
        body: reqBody,
        ack: () => { },
    })
}