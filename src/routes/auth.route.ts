import express from 'express';
import { authController } from '../controllers/auth.controller';
import authMiddleware from '../commons/middlewares/auth';

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
 *   name: User
 *   description: API for managing user registration and auth
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: unique identifier of the user
 *         name:
 *           type: string
 *           description: user's name
 *         email:
 *           type: string
 *           description: user's email
 *         password:
 *           type: string
 *           description: user's password
 *         tokens:
 *           type: array
 *           description: tokens for authentication (access, refresh)
 *     UserCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: user's name
 *         email:
 *           type: string
 *           description: user's email
 *         password:
 *           type: string
 *           description: user's password
 *     UserTokensRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: user's email
 *         password:
 *           type: string
 *           description: user's password
 *     Tokens:
 *       type: object
 *       required:
 *         - accessToken
 *         - refreshToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: user's access token
 *         refreshToken:
 *           type: string
 *           description: user's refresh token
 *     LogoutMessage:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: a logout message
 *     UserUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: updated name of the user
 *           required: false
 *         image:
 *           type: string
 *           description: user's image name
 *           required: false
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary:
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateRequest'
 *           example:
 *             name: "Aya"
 *             email: "myEmail@colman.il"
 *             password: "123456"
 *     responses:
 *       200:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: no password or email provided
 *       500:
 *         description: Internal server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary:
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserTokensRequest'
 *           example:
 *             email: "myEmail@colman.il"
 *             password: "123456"
 *     responses:
 *       200:
 *         description: The tokens for the user to login (access and refresh)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: wrong email or password
 *       500:
 *         description: Internal server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/refreshToken:
 *   post:
 *     summary:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The tokens for the user to login (access and refresh)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       403:
 *         description: Invalid request
 *       401:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/refreshToken', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The tokens for the user to login (access and refresh)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutMessage'
 *       403:
 *         description: invalid request
 *       401:
 *         description: no token provided
 */
router.post('/logout', authController.logout);

router.post('/google', authController.googleSignin);

/**
 * @swagger
 * /api/auth/{userId}:
 *   put:
 *     summary: Update a user by id
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: id of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *           example:
 *             name: "Updated name"
 *             image: "RandomImage.jpg"
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:userId', authMiddleware, authController.updateUser);

export default router;
