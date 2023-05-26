// Setting up the bolt app
import { App } from '@slack/bolt'
import { setupHandlers } from './_handleEvents'
export const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_TOKEN,
    port: 8080
})

let isBoltUp = false

export default async function handler(req, res) {
    if (req.body.type === 'url_verification') {
        return res.status(200).json({ challenge: req.body.challenge })
    }
    res.status(200).json({ success: true })
    if (!isBoltUp) {
        await app.start()
        isBoltUp = true
        console.log('⚡️ Bolt app is running!')
        setupHandlers()
    }
    app.processEvent({
        body: req.body,
        ack: () => { },
    })

}

