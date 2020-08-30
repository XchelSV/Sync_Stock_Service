require('dotenv').config();
const fs = require('fs');
const xml2js = require('xml2js');

const { get_product_from_ticket_venta, get_product_from_cambio_fisico, search_transaction_into_firestore, save_transaction_into_firestore } = require('./functions/product_incidences_functions');
const { getWoocommerceRootAndChildBySKU, get_woocommerce_product_list ,substract_product } = require('./functions/woocommerce_actions');
const parser = new xml2js.Parser();
fs.readFile(__dirname + '/xmls/MTSPORTT0140120200801.xml', function(err, data) {
    parser.parseString(data, async function (err, json_file) {
        //Get Ticket Venta Transactions from XML
        const ticket_results = get_product_from_ticket_venta(json_file);
        //Get Cambio Fisico por talla Transactions from XML
        const cambio_results = get_product_from_cambio_fisico(json_file);
        const product_results = [ ...ticket_results, ...cambio_results ];
        console.log('Products length: ',product_results.length)
        //Get E-commerce product List
        const woocommerce_product_list = await get_woocommerce_product_list();
        //
        for (let i = 0; i < product_results.length; i++) {
          //Search If exists product reference into woocommerce eshop
          const woocommerce_product = await getWoocommerceRootAndChildBySKU(product_results[i].reference, woocommerce_product_list);
          console.log('woocommerce_product',product_results[i].reference, woocommerce_product ? woocommerce_product.child_product.sku : woocommerce_product);
          if (woocommerce_product){
            //Search if transactions exists into firestore
            const firestore_transaction = await search_transaction_into_firestore(product_results[i]);
            if (!firestore_transaction){
              //If not exists, save it
              const transaction_saved = save_transaction_into_firestore(product_results[i]);
              console.log('transaction_saved', transaction_saved);
              if (transaction_saved){
                //Update Woocommerce Stock
                substract_product( woocommerce_product,  product_results[i].quantity);
              }
            }
          }
        }
        return true;
    });
});