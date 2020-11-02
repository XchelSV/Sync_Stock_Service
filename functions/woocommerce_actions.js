const { parse } = require("path");
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/./../.env' });

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const WooCommerce = new WooCommerceRestApi({
    url: process.env.WOOCOMMERCE_URL, // Your store URL
    consumerKey: process.env.WOOCOMMERCE_PUBLIC_KEY, // Your consumer key
    consumerSecret: process.env.WOOCOMMERCE_PRIVATE_KEY, // Your consumer secret
    version: 'wc/v3' // WooCommerce WP REST API version
});
const { sendMail } = require('./send_mail');
const logger = require('../logger/setup');
const sentry = require('../logger/sentry');

exports.get_woocommerce_product_list = async () => {
    try{
        let counter = 1;
        let result = [];
        flag = true;
        //Get Root Product
        while(flag){
            const results = await WooCommerce.get("products",{ status:'publish' , page: counter, stock_status:'instock', per_page: 30, order:'desc'})
                .then( async (response) => {
                    return await response.data;
                })
                .catch( async (error) => {
                    return await [];
                });
            if (results.length > 0){
                result = [ ...result, ...results]
                counter++;
            }
            else{
                flag = false;
            }
        }
        return result;
    }
    catch(error){
        console.log(error)
        logger.error(`get_woocommerce_product_list function, error: ${JSON.stringify(error)}`);
        sentry.send_error(`get_woocommerce_product_list`,error);
        return null;
    }
}

exports.getWoocommerceRootAndChildBySKU = async (sku) => {
    try{
        let result = null
        let child_product = '';
        //Get Root Product
        const [root_product] = await WooCommerce.get(`products/?sku=${sku.slice(0,10)}`,{ status:'publish' })
            .then( async (response) => {
                return await response.data;
            })
            .catch( async (error) => {
                return await null;
            });
        
        console.log(sku,' root_product id',root_product ? root_product.id : null)
        if (root_product){
            //Get Child Product
            const results = await WooCommerce.get(`products/${root_product.id}/variations`,{ status:'publish' })
                .then( async (response) => {
                    return await response.data;
                })
                .catch( async (error) => {
                    return await [];
                });
            if (results.length > 0){
                for (let i = 0; i < results.length; i++) {
                    if (results[i].sku === sku ){
                        child_product = results[i];
                        break;
                    }
                }
            }
            if (child_product !== ''){
                result = { root_product, child_product };
            }
        }
        return result;
    }
    catch(error){
        console.log(error)
        logger.error(`getWoocommerceRootAndChildBySKU function, error: ${JSON.stringify(error)}`);
        sentry.send_error(`getWoocommerceRootAndChildBySKU`,error);
        return null;
    }
}

exports.substract_product = (woocommerce_product, quantity) => {

    let stock_quantity = parseInt(woocommerce_product.child_product.stock_quantity) - parseInt(quantity);
    if (stock_quantity < 0)
        stock_quantity = 0;
    WooCommerce.put(`products/${woocommerce_product.root_product.id}/variations/${woocommerce_product.child_product.id}`, {
        stock_quantity
    })
    .then( async (response) => {
        sendMail( 'xchel.sanchez@mtsport.com.mx', 'PRODUCTO VENDIDO EN PISO ✌📌' , 
            `<p>Se actualizo el stock del producto ${woocommerce_product.child_product.sku}, se restaron ${quantity} unidades, para terminar con un stock de ${stock_quantity} unidades </p>`
        ).then( () => {
            console.log('Mail Sended')
        }).catch( error => {
            console.log(JSON.stringify(error.response)) 
            logger.error(`sendMail function, error: ${JSON.stringify(error)}`);
            sentry.send_error(`sendMail`,error);
        })
    })
    .catch( async (error) => {
        console.log(error.response.data);
        logger.fatal(`substract_product function, error: ${JSON.stringify(error.response)}`);
        sentry.send_error(`substract_product`,error);
    });

}

exports.getPendingOrders = async (sku) => {
    try{
        let counter = 1;
        let result = [];
        flag = true;

        while(flag){
            const results = await WooCommerce.get("orders",{ status:'pending', page: counter, per_page: 30, order:'desc'})
                .then( async (response) => {
                    return await response.data;
                })
                .catch( async (error) => {
                    return await [];
                });
            if (results.length > 0){
                result = [ ...result, ...results]
                counter++;
            }
            else{
                flag = false;
            }
        }
        return result;
    }
    catch(error){
        console.log(error)
        logger.error(`getPendingOrders function, error: ${JSON.stringify(error)}`);
        sentry.send_error(`getPendingOrders`,error);
        return null;
    }
}

exports.getWoocommerceProductByModel = async (model) => {
    try{
        //Get Root Product
        const [root_product] = await WooCommerce.get(`products/?sku=${model}`,{ status:'publish' })
            .then( async (response) => {
                return await response.data;
            })
            .catch( async (error) => {
                return await null;
            });
        return root_product;
    }
    catch(error){
        console.log(error)
        logger.error(`getWoocommerceProductByModel function, error: ${JSON.stringify(error)}`);
        sentry.send_error(`getWoocommerceProductByModel`,error);
        return null;
    }
}