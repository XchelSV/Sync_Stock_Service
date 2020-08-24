let db = require('../firebase/setup');

exports.get_product_from_ticket_venta = (json_file) => {
    try{
        let products = [];
        json_file.transacciones.transaccion.forEach(transaction => {
            if (transaction.encabezado[0].ENCDescripcion[0] === 'Ticket Venta'){
                const current_store = transaction.encabezado[0].ALMCodigo[0];
                const transaction_hour = transaction.encabezado[0].ENCHoraTrx[0];
                for (let i = 0; i < transaction.detalle[0].items[0].item.length; i++) {
                    let product = { id: '', reference:'', store: current_store, quantity: 0 };
                    if (transaction.detalle[0].items[0].item[i]['$'].Tipo === 'Referencia'){
                        const reference_consec = transaction.detalle[0].items[0].item[i]['$'].nitem;
                        product.reference = transaction.detalle[0].items[0].item[i].REFCodigo1[0];
                        product.quantity = parseInt(transaction.detalle[0].items[0].item[i].IRFCantidad);
                        product.id = `${current_store}-${reference_consec}-${transaction_hour}-${transaction.detalle[0].items[0].item[i].REFCodigo1[0]}`;
                        products.push(product);
                    }
                }
            }
        });
        return products;
    }
    catch(error){
        console.log(error)
        return [];
    }
}

exports.search_transaction_into_firestore = async (transaction) => {
    const transaction_finded = await db.collection('transactions').doc(transaction.id).get()
    .then( result => {
        return result.data();
    })
    .catch((err) => {
        console.log('Error getting documents', err);
        return null;
    });
    return transaction_finded;
}

exports.save_transaction_into_firestore = (transaction) => {
    try{
        let transaction_red = db.collection('transactions').doc(transaction.id);
        let setNewTransaction = transaction_red.set({
            'reference': transaction.reference,
            'store': transaction.store,
            'quantity': transaction.quantity,
            'date': new Date()
        });
        return true;
    }
    catch(error){
        return false;
    }
}