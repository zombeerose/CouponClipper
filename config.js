/**
 * PRIVATE CREDENTIALS
 *
 * DO NOT COMMIT THIS FILE
 */
var CouponClipper = CouponClipper || {};
CouponClipper.config = {
    store: {
        frys: {
            name: 'FrysFood',
            user: 'USERNAME',
            password: 'PASSWORD'
        },
        safeway: {
            name: 'Safeway',
            user: 'USERNAME',
            password: 'PASSWORD'
        }
    },
    email: {
        key: 'api:key-XXX',
        from: 'Mailgun Sandbox <postmaster@sandboxXXX.mailgun.org>',
        subject: 'PhantomJS Job',
        to: 'EMAIL',
        url: 'https://api.mailgun.net/v2/sandboxXXX.mailgun.org/messages'
    }
};
