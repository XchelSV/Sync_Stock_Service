let db = require('../firebase/setup');
const logger = require('../logger/setup');
const sentry = require('../logger/sentry');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/./../.env' });

exports.get_product_from_ticket_venta = (json_file) => {
    try{
        let products = [];
        json_file.transacciones.transaccion.forEach(transaction => {
            if (transaction.encabezado[0].ENCDescripcion[0] === 'Ticket Venta'){
                const current_store = transaction.encabezado[0].ALMCodigo[0];
                const transaction_hour = transaction.encabezado[0].ENCHoraTrx[0];
                const transaction_date = transaction.encabezado[0].ENCFechaTrx[0];
                const date_splitted = transaction_date.split('/');
                for (let i = 0; i < transaction.detalle[0].items[0].item.length; i++) {
                    let product = { id: '', reference:'', store: current_store, quantity: 0 };
                    if (transaction.detalle[0].items[0].item[i]['$'].Tipo === 'Referencia'){
                        const reference_consec = transaction.detalle[0].items[0].item[i]['$'].nitem;
                        product.reference = transaction.detalle[0].items[0].item[i].REFCodigo1[0];
                        product.quantity = parseInt(transaction.detalle[0].items[0].item[i].IRFCantidad);
                        product.id = `Ticket Venta-${current_store}-${reference_consec}-${date_splitted[0]}-${date_splitted[1]}-${date_splitted[2]}-${transaction_hour}-${transaction.detalle[0].items[0].item[i].REFCodigo1[0]}`;
                        products.push(product);
                    }
                }
            }
        });
        return products;
    }
    catch(error){
        console.log(error)
        logger.error(`get_product_from_ticket_venta function, error: ${JSON.stringify(error)}`);
        sentry.send_error(`get_product_from_ticket_venta`,error);
        return [];
    }
}

exports.get_product_from_cambio_fisico= (json_file) => {
    try{
        let products = [];
        json_file.transacciones.transaccion.forEach(transaction => {
            if (transaction.encabezado[0].ENCDescripcion[0] === 'Cambio Fisico por talla'){
                const current_store = transaction.encabezado[0].ALMCodigo[0];
                const transaction_hour = transaction.encabezado[0].ENCHoraTrx[0];
                const transaction_date = transaction.encabezado[0].ENCFechaTrx[0];
                const date_splitted = transaction_date.split('/');
                for (let i = 0; i < transaction.detalle[0].items[0].item.length; i++) {
                    let product = { id: '', reference:'', store: current_store, quantity: 0 };
                    if (transaction.detalle[0].items[0].item[i]['$'].Tipo === 'Referencia'){
                        const reference_consec = transaction.detalle[0].items[0].item[i]['$'].nitem;
                        product.reference = transaction.detalle[0].items[0].item[i].REFCodigo1[0];
                        product.quantity = parseInt(transaction.detalle[0].items[0].item[i].IRFCantidad);
                        product.id = `Cambio Fisico por talla-${current_store}-${reference_consec}-${date_splitted[0]}-${date_splitted[1]}-${date_splitted[2]}-${transaction_hour}-${transaction.detalle[0].items[0].item[i].REFCodigo1[0]}`;
                        products.push(product);
                    }
                }
            }
        });
        return products;
    }
    catch(error){
        console.log(error)
        logger.error(`get_product_from_cambio_fisico function, error: ${JSON.stringify(error)}`);
        sentry.send_error(`get_product_from_cambio_fisico`,error);
        return [];
    }
}

exports.get_product_from_nota_mostrador= (json_file) => {
    try{
        let products = [];
        json_file.transacciones.transaccion.forEach(transaction => {
            if (transaction.encabezado[0].ENCDescripcion[0] === 'Nota Credito Mostrador'){
                const current_store = transaction.encabezado[0].ALMCodigo[0];
                const transaction_hour = transaction.encabezado[0].ENCHoraTrx[0];
                const transaction_date = transaction.encabezado[0].ENCFechaTrx[0];
                const date_splitted = transaction_date.split('/');
                for (let i = 0; i < transaction.detalle[0].items[0].item.length; i++) {
                    let product = { id: '', reference:'', store: current_store, quantity: 0 };
                    if (transaction.detalle[0].items[0].item[i]['$'].Tipo === 'Referencia'){
                        const reference_consec = transaction.detalle[0].items[0].item[i]['$'].nitem;
                        product.reference = transaction.detalle[0].items[0].item[i].REFCodigo1[0];
                        product.quantity = parseInt(transaction.detalle[0].items[0].item[i].IRFCantidad);
                        product.id = `Nota Credito Mostrador-${current_store}-${reference_consec}-${date_splitted[0]}-${date_splitted[1]}-${date_splitted[2]}-${transaction_hour}-${transaction.detalle[0].items[0].item[i].REFCodigo1[0]}`;
                        products.push(product);
                    }
                }
            }
        });
        return products;
    }
    catch(error){
        console.log(error)
        logger.error(`get_product_from_nota_mostrador function, error: ${JSON.stringify(error)}`);
        sentry.send_error(`get_product_from_nota_mostrador`,error);
        return [];
    }
}

exports.search_transaction_into_firestore = async (transaction) => {
    const transaction_finded = await db.collection('store').doc(process.env.CURRENT_STORE).collection('transactions').doc(transaction.id).get()
    .then( result => {
        return result.data();
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        logger.error(`search_transaction_into_firestore function, error: ${JSON.stringify(err)}`);
        sentry.send_error(`search_transaction_into_firestore`,error);
        return null;
    });
    return transaction_finded;
}

exports.save_transaction_into_firestore = (transaction) => {
    try{
        let transaction_red = db.collection('store').doc(process.env.CURRENT_STORE).collection('transactions').doc(transaction.id);
        let setNewTransaction = transaction_red.set({
            'reference': transaction.reference,
            'store': transaction.store,
            'quantity': transaction.quantity,
            'date': new Date()
        });
        return true;
    }
    catch(error){
        logger.fatal(`save_transaction_into_firestore function, error: ${JSON.stringify(error)}`);
        sentry.send_error(`save_transaction_into_firestore`,error);
        return false;
    }
}