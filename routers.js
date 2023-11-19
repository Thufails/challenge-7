const express = require('express'),
    router = express.Router(),
    controller = require('./controllers'),
    { user } = require('./model');

router.get('/', (req, res) => {
    return res.render('index');
})

router.get('/reset-password', (req, res) => {
    return res.render('resetPassword');
})
router.get('/set-password/:key', async(req, res) => {
    try {
        console.log(req.params.key)
        const findData = await user.findFirst({
            where: {
                resetPasswordToken: req.params.key
            }
        })
        if (!findData) {
            return res.render('error')
        }

        return res.render('setPassword', { user: findData });
    } catch (error) {
        console.log(error)
        return res.render('error')
    }

});

router.post('/api/v1/register', controller.registerUser);
router.post('/api/v1/reset-password', controller.resetPassword);
router.post('/api/v1/set-password', controller.setPassword);
// router.get('/api/v1/login', controller.loginUser)
module.exports = router