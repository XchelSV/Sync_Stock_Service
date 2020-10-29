const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/./.env' });

const { sendMail } = require('./functions/send_mail');
const sentry = require('./logger/sentry');

const { getPendingOrders } = require('./functions/woocommerce_actions');

const main = async () => {
    const orders = await getPendingOrders();
    console.log('Orders', orders);
    console.log('Orders length', orders.length);
}

main();

