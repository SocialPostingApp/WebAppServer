import express from "express";
import postController from "../controllers/post.controller";
import authMiddleware from "../commons/middlewares/auth";

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: API for managing posts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: unique identifier of the post
 *         ownerId:
 *           type: string
 *           description: id of the user who created the post
 *         title:
 *           type: string
 *           description: post's title
 *         content:
 *           type: string
 *           description: post's content
 *         image:
 *           type: string
 *           description: post's image name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: timestamp of the post creation
 *
*     PostCreateRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           description: post's title
 *         content:
 *           type: string
 *           description: post's content
 *         image:
 *           type: string
 *           description: post's image name
 *
 *     PostUpdateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: updated title of the post
 *         content:
 *           type: string
 *           description: updated content of the post
 *         image:
 *           type: string
 *           description: post's image name
 */

/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     summary: Get post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: id of the post to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authMiddleware, postController.getPostById);

/**
 * @swagger
* /api/post:
 *   get:
 *     summary: Get posts by user id or all posts
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sender
 *         required: false
 *         description: id of the user whos' posts to get. if ommited, all posts will be returned
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An array of the user's posts or all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, (req, res) => {
    if (req.query.sender) {
        return postController.getPostsBySender(req, res);
    }
    
    return postController.getAllPosts(req, res);
});

/**
 * @swagger
* /api/post:
 *   post:
 *     summary: Create a new post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostCreateRequest'
 *           example:
 *             title: "Random title"
 *             content: "Content for the post"
 *             owner: "675016b349f76c9c0a7ab99a"
 *             image: "RandomImage.jpg"
 *     responses:
 *       200:
 *         description: The created post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, postController.createPost);

/**
 * @swagger
* /api/post/{id}:
 *   put:
 *     summary: Update a post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: id of the post to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostUpdateRequest'
 *           example:
 *             title: "Updated title"
 *             content: "Updated content!"
 *             image: "RandomImage.jpg"
 *     responses:
 *       200:
 *         description: The updated post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, postController.updatePost);

export default router;
