const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const WooCommerce = new WooCommerceRestApi({
    url: process.env.WOOCOMMERCE_URL, // Your store URL
    consumerKey: process.env.WOOCOMMERCE_PUBLIC_KEY, // Your consumer key
    consumerSecret: process.env.WOOCOMMERCE_PRIVATE_KEY, // Your consumer secret
    version: 'wc/v3' // WooCommerce WP REST API version
});

exports.getWoocommerceRootAndChildBySKU = async (sku) => {
    try{
        let counter = 1;
        let result = null
        let root_product = '';
        let child_product = '';
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
                for (let i = 0; i < results.length; i++) {
                    if (results[i].sku === sku.slice(0,10)){
                        root_product = results[i];
                        flag = false;
                        break;
                    }
                }
                counter++;
            }
            else{
                flag = false;
            }
        }
        if (root_product !== ''){
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
        return null;
    }
}

exports.substract_product = () => {

}