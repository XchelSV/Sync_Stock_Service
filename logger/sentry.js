require('dotenv').config({ path: __dirname + '/./../.env' });
const Sentry = require('@sentry/node');

exports.send_error = (function_name, error) => {
    Sentry.init({ 
        dsn: process.env.SENTRY_URL, 
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0
    });
    Sentry.configureScope(function(scope) {
        
        scope.setTag("transaction", function_name);
        if (error.response){
            scope.setTag("status", error.response.status);
            Sentry.captureException(error.response);
        }
        else{
            Sentry.captureException(error);
        }
    });
}