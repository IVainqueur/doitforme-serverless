import { subtype } from '@slack/bolt'
import { app } from './index'
import { logger } from '@/utils/logger'
const NIGEN_URI = process.env.NIGEN_URI


export function setupHandlers() {
    app.message(/^(hello|hi|hey)$/i, async ({ message, say, }) => {
        logger.info("I am being greated")
        await say(`Wassup, <@${message.user}>`);
    })

    app.event('app_mention', async({ body, client, say }) => {
        logger.info("I was mentioned")
        await client.reactions.add({
            name: 'wave',
            channel: body.event.channel,
            timestamp: body.event.ts
        })

    })

    // Snitching on deleted messages
    app.message(subtype('message_deleted'), async ({ message, say }) => {
        const user = await getUserInfo(message.previous_message.user)
        const userInfo = {
            name: user ? user.profile.display_name : undefined,
            avatar: user ? user.profile.image_72 : undefined,
            id: user ? user.id : undefined,
            locale: user ? user.locale : undefined,
        }
        logger.info({ tz: user.tz, message_ts: message.previous_message.ts })
        const compositionDate = new Date(Number(Math.floor(message.previous_message.ts) * 1000)).toLocaleString('en-US', {
            timeZone: user.tz,
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        })
        let reply = null;
        if (!message.previous_message.thread_ts) {
            const thread_ts = message.previous_message.ts
            reply = await say({
                text: `<!channel>, <@${message.previous_message.user}> deleted their message!`,
                thread_ts,
            })
        }


        const screenshotURI = `${NIGEN_URI}?message=${encodeURI(message.previous_message.text)}&username=${encodeURI(userInfo.name)}&time=${encodeURI(compositionDate)}&avatar=${userInfo.avatar}`
        await say({
            text: reply ? '' : `<!channel>, <@${message.previous_message.user}> deleted their message!`,
            thread_ts: reply ? reply.ts : message.previous_message.thread_ts,
            attachments: [
                {
                    fallback: "Removed message info",
                    image_url: screenshotURI,
                    thumb_url: screenshotURI,
                    text: 'screenshot',

                }
            ]
        })
        logger.info(screenshotURI)
    })
}

async function getUserInfo(userId) {
    return (await app.client.users.info({ user: userId })).user ?? null
}