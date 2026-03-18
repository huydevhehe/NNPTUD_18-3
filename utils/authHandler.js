let userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
const fs = require('fs');

const publicKey = fs.readFileSync('./keys/public.pem');

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let token = req.headers.authorization;

            if (!token) {
                return res.status(401).send({
                    message: "ban chua dang nhap"
                });
            }

            // 👇 fix Bearer token
            if (token.startsWith("Bearer ")) {
                token = token.split(" ")[1];
            }

            let result = jwt.verify(token, publicKey, {
                algorithms: ['RS256']
            });

            let user = await userController.GetAnUserById(result.id);

            if (!user) {
                return res.status(401).send({
                    message: "ban chua dang nhap"
                });
            }

            req.user = user;
            next();

        } catch (error) {
            return res.status(401).send({
                message: "ban chua dang nhap"
            });
        }
    }
}