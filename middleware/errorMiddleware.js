exports.errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error(err.stack);
    
    if (req.headers['content-type'] === 'application/json') {
        return res.status(statusCode).json({
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    }
    
    res.status(statusCode);
    res.render('error', {
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};