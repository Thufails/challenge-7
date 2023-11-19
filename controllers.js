const { user } = require('./model');
const utils = require('./utils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

module.exports = {
    registerUser: async(req, res) => {
        try {

            //throw new Error('Testing error');
            const data = await user.create({
                data: {
                    email: req.body.email,
                    password: await utils.cryptPassword(req.body.password),
                }
            })

            return res.status(201).json({
                data
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error
            });
        }
    },
    loginUser: async(req, res) => {
        try {
            const findUser = await user.findFirst({
                where: {
                    email: req.body.email
                }
            })
            if (!findUser) {
                return res.status(404).json({
                    error: 'User not exists'
                });
            }
            if (bcrypt.compareSync(req.body.password, findUser.password)) {
                const token = jwt.sign({ id: findUser.id }, 'secret_key', { expiresIn: '6h' })

                return res.status(200).json({
                    data: {
                        token
                    }
                })
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error
            });
        }
    },
    resetPassword: async(req, res) => {
        try {
            const findUser = await user.findFirst({
                where: {
                    email: req.body.email
                }
            });

            if (!findUser) {
                return res.render('error');
            }

            const encrypt = await utils.cryptPassword(req.body.email);

            await user.update({
                data: {
                    resetPasswordToken: encrypt,
                },
                where: {
                    id: findUser.id
                }
            });
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: 'rafibauk17@gmail.com',
                    pass: 'mxht tykn lzif ogfp'
                },
            });
            const email = req.body.email;
            const htmlTemplate =
                `<body>
            <div class="container">
                <h1>🎉 Hii ${email}, Your Email<br />Was Successfully Reset 🎉</h1>
                <p>
                    To set a new password, click the following link:
                    <br />
                    <a href="http://localhost:3000/set-password/${encrypt}">Click Here</a>
                </p>
            </div>
        </body>`
            const mailOptions = {
                from: 'system@gmail.com',
                to: 'rafibauk17@gmail.com',
                subject: "Reset Password",
                html: htmlTemplate
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }

                transporter.close();
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error
            });
        }
    },
    setPassword: async(req, res) => {
        try {

            const findUser = await user.findFirst({
                where: {
                    resetPasswordToken: req.body.key
                }
            });

            if (!findUser) {
                return res.render('error');
            }

            await user.update({
                data: {
                    password: await utils.cryptPassword(req.body.password),
                    resetPasswordToken: null
                },
                where: {
                    id: findUser.id
                }
            });

            return res.render('succes');

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error
            });
        }
    }
}