require('dotenv').config();
const fs = require('fs');
const xml2js = require('xml2js');

const { get_product_from_ticket_venta, search_transaction_into_firestore, save_transaction_into_firestore } = require('./functions/product_incidences_functions');
const { getWoocommerceRootAndChildBySKU, substract_product } = require('./functions/woocommerce_actions');
const parser = new xml2js.Parser();
fs.readFile(__dirname + '/xml_example_2.xml', function(err, data) {
    parser.parseString(data, async function (err, json_file) {
        //Get Ticket Venta Transactions from XML
        const product_results = get_product_from_ticket_venta(json_file);
        for (let i = 0; i < product_results.length; i++) {
          //Search If exists product reference into woocommerce eshop
          const woocommerce_product = await getWoocommerceRootAndChildBySKU(product_results[i].reference);
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