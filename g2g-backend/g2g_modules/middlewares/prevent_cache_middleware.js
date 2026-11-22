/**
 * 
 */

var preventCache = function (req, res, next) { // disable caching
	    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	    res.header('Expires', '-1');
	    res.header('Pragma', 'no-cache');
	    next();
}

exports.preventCache = preventCache;