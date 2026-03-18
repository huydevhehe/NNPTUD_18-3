let express = require('express');
let router = express.Router();

let userController = require('../controllers/users');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
const fs = require('fs');

const { CheckLogin } = require('../utils/authHandler');

// 🔑 load private key (RS256)
const privateKey = fs.readFileSync('./keys/private.pem');


// ================= REGISTER =================
router.post('/register', async function (req, res) {
    try {
        let { username, password, email } = req.body;

        if (!username || !password) {
            return res.status(400).send({
                message: "Thiếu username hoặc password"
            });
        }

        let user = await userController.GetAnUserByUsername(username);
        if (user) {
            return res.status(400).send({
                message: "Username đã tồn tại"
            });
        }

        let newUser = await userController.CreateAnUser(
            username,
            password,
            email
        );

        res.send(newUser);

    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


// ================= LOGIN =================
router.post('/login', async function (req, res) {
    try {
        let { username, password } = req.body;

        let user = await userController.GetAnUserByUsername(username);

        if (!user) {
            return res.status(404).send({
                message: "thong tin dang nhap khong dung"
            });
        }

        // check bị lock


        // check password
        if (bcrypt.compareSync(password, user.password)) {

            await userController.ResetLogin(user.id);

            let token = jwt.sign(
                { id: user.id },
                privateKey,
                {
                    algorithm: 'RS256',
                    expiresIn: '1d'
                }
            );

            return res.send({
                accessToken: token
            });

        } else {

            await userController.UpdateLoginFail(user);

            return res.status(404).send({
                message: "thong tin dang nhap khong dung"
            });
        }

    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


// ================= /ME =================
router.get('/me', CheckLogin, function (req, res) {
    res.send(req.user);
});


// ================= CHANGE PASSWORD =================
router.put('/change-password', CheckLogin, async function (req, res) {
    try {
        let { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).send({
                message: "Thiếu dữ liệu"
            });
        }

        // validate password
        if (newPassword.length < 6) {
            return res.status(400).send({
                message: "Password >= 6 ký tự"
            });
        }

        if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            return res.status(400).send({
                message: "Password phải có chữ và số"
            });
        }

        let user = await userController.GetAnUserById(req.user.id);

        if (!user) {
            return res.status(404).send({
                message: "User không tồn tại"
            });
        }

        let isMatch = bcrypt.compareSync(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).send({
                message: "Old password không đúng"
            });
        }

        await userController.UpdatePassword(user.id, newPassword);

        res.send({
            message: "Đổi mật khẩu thành công"
        });

    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

module.exports = router;