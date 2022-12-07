import fastify from 'fastify'
import sensible from "@fastify/sensible"
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import dotnev from "dotenv"
import {
    PrismaClient
} from '@prisma/client'

dotnev.config()

const app = fastify();
app.register(sensible);
app.register(cookie, {
    secret: process.env.COOKIE_SECRET
})
app.register(cors, {
    origin: process.env.CLIENT_URL,
    credentials: true
})
app.addHook('onRequest', (req, res, done) => {
    if (req.cookies.uesrId != CURRENT_USER_ID) {
        req.cookies.userId = CURRENT_USER_ID;
        res.clearCookie('userId');
        res.setCookie('userId', CURRENT_USER_ID);
    }
    done();
})
const prisma = new PrismaClient()
const CURRENT_USER_ID = (await prisma.user.findFirst({
    where: {
        name: "Kyle"
    }
})).id;
const COMMENT_SELECT_FIELDS = {
    id: true,
    message: true,
    parentId: true,
    createdAt: true,
    user: {
        select: {
            id: true,
            name: true
        }
    }
}


app.get('/posts', async (req, res) => {
    return await commitToDb(prisma.post.findMany({
        select: {
            id: true,
            title: true
        }
    }))
})

app.get('/posts/:id', async (req, res) => {
    return await commitToDb(prisma.post.findUnique({
        where: {
            id: req.params.id
        },
        select: {
            body: true,
            title: true,
            comments: {
                orderBy: {
                    createdAt: 'desc'
                },
                select: COMMENT_SELECT_FIELDS
            }
        }
    }))
})


app.post('/posts/:id/comments', async (req, res) => {
    if (req.body.message === '' || req.body.message === null) {
        return res.send(app.httpErrors.badRequest("Message is required"))
    }

    return await commitToDb(
        prisma.comment.create({
            data: {
                message: req.body.message,
                userId: req.cookies.userId,
                parentId: req.body.parentId,
                postId: req.params.id
            },
            select: COMMENT_SELECT_FIELDS
        })
    )
})

app.patch('/posts/:id/comments/:commentId', async (req, res) => {
    if (req.body.message === '' || req.body.message === null) {
        return res.send(app.httpErrors.badRequest("Message is required"))
    }

    const comment = await prisma.comment.findUnique({
        where: {
            id: req.params.commentId
        },
    });

    if (comment.userId !== req.cookies.userId) {
        return res.send(app.httpErrors.unauthorized('Don\'t have permission to edit'))
    }

    return await commitToDb(
        prisma.comment.update({
            where: {
                id: req.params.commentId
            },
            data: {
                message: req.body.message
            },
            select: COMMENT_SELECT_FIELDS
        })
    )
})

app.delete('/posts/:id/comments/:commentId', async (req, res) => {
    if (req.body.message === '' || req.body.message === null) {
        return res.send(app.httpErrors.badRequest("Message is required"))
    }

    const comment = await prisma.comment.findUnique({
        where: {
            id: req.params.commentId
        },
    });

    if (comment.userId !== req.cookies.userId) {
        return res.send(app.httpErrors.unauthorized('Don\'t have permission to delete'))
    }

    return await commitToDb(
        prisma.comment.delete({
            where: {
                id: req.params.commentId
            }
        })
    )
})

async function commitToDb(promise) {
    const [err, data] = await app.to(promise)
    if (err) return app.httpErrors.internalServerError(err.message)
    return data;
}

app.listen({
    port: process.env.PORT
})