const db = require('../utils/db');
const bcrypt = require('bcrypt');

module.exports = {

    CreateAnUser: async (username, password, email) => {
        const hash = bcrypt.hashSync(password, 10);

        const result = await db.query(
            `INSERT INTO users (username, password, email)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [username, hash, email]
        );

        return result.rows[0];
    },

    GetAnUserByUsername: async (username) => {
        const result = await db.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );
        return result.rows[0];
    },

    GetAnUserById: async (id) => {
        const result = await db.query(
            `SELECT * FROM users WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    },

    UpdateLoginFail: async (user) => {
        let loginCount = user.login_count + 1;
        let lockTime = user.lock_time;

        if (loginCount >= 3) {
            loginCount = 0;
            lockTime = Date.now() + 3600 * 1000;
        }

        await db.query(
            `UPDATE users SET login_count = $1, lock_time = $2 WHERE id = $3`,
            [loginCount, lockTime, user.id]
        );
    },

    ResetLogin: async (userId) => {
        await db.query(
            `UPDATE users SET login_count = 0 WHERE id = $1`,
            [userId]
        );
    },

    UpdatePassword: async (userId, newPassword) => {
        const hash = bcrypt.hashSync(newPassword, 10);

        await db.query(
            `UPDATE users SET password = $1 WHERE id = $2`,
            [hash, userId]
        );
    }

};