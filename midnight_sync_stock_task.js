const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config({ path: __dirname + '/./.env' });

const { sendMail } = require('./functions/send_mail');
const sentry = require('./logger/sentry');
const logger = require('./logger/setup');

const { getWoocommerceProductByModel, getPendingOrders } = require('./functions/woocommerce_actions');

const main = async () => {
    try{
        const stores = process.env.STORES_TO_SYNC;
        const current_modelos = await axios.get(`${process.env.COMERSSIA_URL}/api/get/in_stock/modelos`, {
            params: {
                stores
            }
        })
        //Modelos Loop
        for (let i = 0; i < current_modelos.data.length; i++) {
            //Searching Comerssia model product into woocommerce
            const current_product = await getWoocommerceProductByModel(current_modelos.data[i].Modelo);
            //If woocommerce product exists
            if (current_product){
                console.log('Woocommerce Product Finded: ',i,' ',current_product.sku);
                //Searching Comerssia Product References
                const current_references = await axios.get(`${process.env.COMERSSIA_URL}/api/get/in_stock/references/by/modelo`, {
                    params: {
                        stores,
                        modelos: current_modelos.data[i].Modelo
                    }
                })
                current_references.data.forEach(async reference => {
                    //Get Woocommerce reference stock
                    const woocommerce_reference = await getWoocommerceProductByModel(reference.Referencia);
                    if (woocommerce_reference){
                        //If woocommerce reference exists
                        console.log('Woocommerce Reference Finded: ',woocommerce_reference.sku);
                        if (woocommerce_reference.stock_quantity !== reference.Suma_Cantidad){
                            //If stock is unsynchronized
                            console.log('Stock unsynchronized - Stock Quantity: ',woocommerce_reference.stock_quantity,', Comerssia Stock: ',reference.Suma_Cantidad)
                        }
                    }

                });

            }
        }
        return true;
    }
    catch(error){
        if (error.response){
            logger.error(`Mindnight Sync Task Axios Error: ${JSON.stringify(error.response)}`);
            sentry.send_error(`Mindnight Sync Task Axios Error:`,error.response);
        }
        else{
            logger.error(`Mindnight Sync Task Error: ${JSON.stringify(error)}`);
            sentry.send_error(`Mindnight Sync Task Error:`,error);
        }
        return false;
    }
    

    const orders = await getPendingOrders();
    //console.log('Orders', orders);
    //console.log('Orders length', orders.length);
}

main();

