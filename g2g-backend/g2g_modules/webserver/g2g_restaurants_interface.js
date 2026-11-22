var g2gConfigurationsBusiness = require('../business/g2g_configurations_business.js');
var g2gRestaurantsBusiness = require('../business/g2g_restaurants_business.js');

var verifyZipCodeAvailabilityForRestaurant = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var zipCode = req.params.zipCode;
		var restaurantId = req.params.restaurantId;
		g2gRestaurantsBusiness.verifyZipCodeAvailabilityForRestaurant(restaurantId, zipCode, 
			function(availability) {
				res.json({availability: availability});
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/verfiyZipCodeAvailability");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllActiveRestaurantsByZipCode = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var zipCode = req.params.zipCode;
		var includeLogos = true;
		g2gRestaurantsBusiness.getAllActiveRestaurantsByZipCode(zipCode,
			function() { // onG2GClosed
				g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configuration){
					res.status(503).send(configuration.offlineMessage);
				}, function(err){
					res.status(503).send("G2G is offline at the moment.");
				});
			},
			function(restaurants) {
				res.json(restaurants);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			}, includeLogos); // retrieve logos
	} catch (error) {
		console.log("An error occured in /restaurants/restaurants");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllActiveRestaurantsLogosV2 = function(req, res) {
	try {
		// call the business function and give it the callback functions
		g2gRestaurantsBusiness.getAllActiveRestaurantsLogos(
			function(logos) {
				res.json(logos);
			}, 
			function(err) {
				console.log(err);
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /v2/restaurants/logos");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};


var getAllActiveRestaurantsByZipCodeV2 = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var zipCode = req.params.zipCode;
		var includeLogos = false;
		g2gRestaurantsBusiness.getAllActiveRestaurantsByZipCode(zipCode,
			function(restaurants) { // onG2GClosed
				g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configuration){
					res.status(503).json({g2gClosed: true, restaurants: restaurants.restaurants, offlineMessage: configuration.offlineMessage});
				}, function(err){
					res.status(503).json({g2gClosed: true, restaurants: restaurants.restaurants, offlineMessage: "G2G is offline at the moment."});
				});
			},
			function(restaurants) {
				res.json({g2gClosed: false, restaurants: restaurants.restaurants});
			}, 
			function(err) {
				console.log(err);
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			}, includeLogos);
	} catch (error) {
		console.log("An error occured in v2/restaurants/:zipCode");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getItemsByRestaurantId = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var restaurantId = req.params.restaurantId;
		g2gRestaurantsBusiness.getAllItemsByRestaurantId(restaurantId,
			function(items) {
			res.xls("Items.xlsx", items);
			}, 
			function(err) {
				console.log(err);
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in restaurantitems/:restaurantId");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getRestaurantAvailability = function(req, res) {
	try {
		var restaurantId = req.params.restaurantId;
		
		g2gConfigurationsBusiness.getCurrentApplicationConfiguration(function(configuration){
			g2gConfigurationsBusiness.g2gIsOnline(function() {
				// yes, we're open, now check the restaurant
				g2gRestaurantsBusiness.getRestaurantById(restaurantId, function(restaurant) {
					var restaurantIsOpen = g2gRestaurantsBusiness.restaurantIsOpen(restaurant);
					res.json({g2gIsOpen: true, restaurantIsOpen: restaurantIsOpen});
				}, function(err) { // error of finding restaurant by id
					console.log(err);
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
			}, function() {
				// no, we're closed, also check the restaurant
				g2gRestaurantsBusiness.getRestaurantById(restaurantId, function(restaurant) {
					var restaurantIsOpen = g2gRestaurantsBusiness.restaurantIsOpen(restaurant);
					res.json({g2gIsOpen: false, restaurantIsOpen: restaurantIsOpen, offlineMessage: configuration.offlineMessage});
				}, function(err) { // error of finding restaurant by id
					console.log(err);
					res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
				});
			}, function(err) { // error of finding if g2g is open or closed
				console.log(err);
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
		}, function(err) { // error of getting configurations
			console.log(err);
			res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
		});
		
	} catch (error) {
		console.log("An error occured in /restaurants/restaurant/:restaurantId/availability");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllRestaurants = function(req, res) {
	try {
		// call the business function and give it the callback functions
		g2gRestaurantsBusiness.getAllRestaurants( 
			function(restaurants) {
				res.json(restaurants);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var createRestaurant = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var restaurant = req.body.restaurant;
		g2gRestaurantsBusiness.createRestaurant(restaurant,
			function(restaurant) {
				res.json(restaurant);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var createCategory = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var category = req.body.category;
		g2gRestaurantsBusiness.createCategory(category,
			function(category) {
				res.json(category);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/category");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var createItem = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var item = req.body.item;
		g2gRestaurantsBusiness.createItem(item,
			function(item) {
				res.json(item);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/categories/item");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var createSideGroup = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var sideGroup = req.body.sideGroup;
		g2gRestaurantsBusiness.createSideGroup(sideGroup,
			function(sideGroup) {
				res.json(sideGroup);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/categories/items/sidegropu");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var createSideGroupItem = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var sideGroupItem = req.body.sideGroupItem;
		g2gRestaurantsBusiness.createSideGroupItem(sideGroupItem,
			function(sideGroupItem) {
				res.json(sideGroupItem);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/categories/items/sidegroups/sidegroupitem");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var createRestaurantZipCode = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var zipCode = req.body.zipCode;
		var restaurantId = req.body.restaurantId;
		g2gRestaurantsBusiness.createRestaurantZipCode(restaurantId, zipCode,
			function(zipCode) {
				res.json(zipCode);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/zipcode");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updateRestaurant = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var restaurant = req.body.restaurant;
		g2gRestaurantsBusiness.updateRestaurant(restaurant,
			function() {
				res.json();
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updateCategory = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var category = req.body.category;
		g2gRestaurantsBusiness.updateCategory(category,
			function() {
				res.json();
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/category");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updateItem = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var item = req.body.item;
		g2gRestaurantsBusiness.updateItem(item,
			function() {
				res.json();
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/categories/item");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updateSideGroup = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var sideGroup = req.body.sideGroup;
		g2gRestaurantsBusiness.updateSideGroup(sideGroup,
			function() {
				res.json();
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/categories/items/sidegropu");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updateSideGroupItem = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var sideGroupItem = req.body.sideItem;
		g2gRestaurantsBusiness.updateSideGroupItem(sideGroupItem,
			function() {
				res.json();
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/categories/items/sidegroups/sidegroupitem");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var updateRestaurantZipCode = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var zipCode = req.body.zipCode;
		var restaurantId = req.body.restaurantId;
		g2gRestaurantsBusiness.updateRestaurantZipCode(restaurantId, zipCode,
			function() {
				res.json();
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/zipcode");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllCategoriesByRestaurantId = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var restaurantId = req.params.restaurantId;
		g2gRestaurantsBusiness.getAllCategoriesByRestaurantId(restaurantId,
			function(categories) {
				res.json(categories);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/:restaurantId/restaurantMenuCategories");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllZipCodesByRestaurantId = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var restaurantId = req.params.restaurantId;
		g2gRestaurantsBusiness.getAllZipCodesByRestaurantId(restaurantId,
			function(zipCodes) {
				res.json(zipCodes);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/:restaurantId/restaurantMenuCategories");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllItemsByCategoryId = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var categoryId = req.params.categoryId;
		g2gRestaurantsBusiness.getAllItemsByCategoryId(categoryId,
			function(items) {
				res.json(items);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/categories/:categoryId/items");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllSideGroupsByItemId = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var itemId = req.params.itemId;
		g2gRestaurantsBusiness.getAllSideGroupsByItemId(itemId,
			function(groups) {
				res.json(groups);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/:restaurantId/restaurantMenuCategories");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getAllSideItemsBySideGroupId = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var sideGroupId = req.params.sideGroupId;
		g2gRestaurantsBusiness.getAllSideItemsBySideGroupId(sideGroupId,
			function(items) {
				res.json(items);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/categories/items/sidegroups/:sideGroupId/items");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getActiveRestaurantMenuCategoriesByRestaurantId = function(req, res) {
	try {
		// call the business function and give it the callback functions
		g2gRestaurantsBusiness.getActiveRestaurantMenuCategoriesByRestaurantId(req.params.restaurantId,
			function(menuCategories) {
				res.json(menuCategories);
			},
			function(err){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurant/restaurantMenuCategories");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId = function(req, res) {
	try {
		// call the business function and give it the callback functions
		g2gRestaurantsBusiness.getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId(req.params.restaurantMenuCategoryId,
			function(restaurantMenuCategoryItems) {
				res.json(restaurantMenuCategoryItems);
			},
			function(err){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/restaurantMenuCategoryItems");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var copySideGroupToSiblingItemsOfItem = function(req, res) {
	try {
		// call the business function and give it the callback functions
		var restaurantMenuCategoryItemIds = req.body.itemIds;
		var sideGroup = req.body.sideGroup;
		var restaurantMenuCategoryId = req.body.restaurantMenuCategoryId;
		g2gRestaurantsBusiness.copySideGroupToSiblingItemsOfItem(sideGroup, restaurantMenuCategoryId, restaurantMenuCategoryItemIds,
			function() {
				res.end();
			},
			function(err){
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/categories/items/sidegroup/:sideGroupId/copy");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

var getActivityChart = function(req, res) {
	try {
		// call the business function and give it the callback functions
		g2gRestaurantsBusiness.getActivityChart(
			function(response) {
				res.json(response);
			}, 
			function(err) {
				res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for the inconvinence.");
			});
	} catch (error) {
		console.log("An error occured in /restaurants/activitychart");
		console.log(error);
		res.status(500).send("G2G servers are unable to serve your request at this time. We're sorry for any inconvinence.");
	}
};

exports.verifyZipCodeAvailabilityForRestaurant = verifyZipCodeAvailabilityForRestaurant;
exports.getAllActiveRestaurantsByZipCode = getAllActiveRestaurantsByZipCode;
exports.getAllActiveRestaurantsLogosV2 = getAllActiveRestaurantsLogosV2;
exports.getAllActiveRestaurantsByZipCodeV2 = getAllActiveRestaurantsByZipCodeV2;
exports.getRestaurantAvailability = getRestaurantAvailability;
exports.getAllRestaurants = getAllRestaurants;
exports.createRestaurant = createRestaurant;
exports.createCategory = createCategory;
exports.createItem = createItem;
exports.createSideGroup = createSideGroup;
exports.createSideGroupItem = createSideGroupItem;
exports.createRestaurantZipCode = createRestaurantZipCode;
exports.updateRestaurant = updateRestaurant;
exports.updateCategory = updateCategory;
exports.updateItem = updateItem;
exports.updateSideGroup = updateSideGroup;
exports.updateSideGroupItem = updateSideGroupItem;
exports.updateRestaurantZipCode = updateRestaurantZipCode;
exports.getAllCategoriesByRestaurantId = getAllCategoriesByRestaurantId;
exports.getAllZipCodesByRestaurantId = getAllZipCodesByRestaurantId;
exports.getAllItemsByCategoryId = getAllItemsByCategoryId;
exports.getAllSideGroupsByItemId = getAllSideGroupsByItemId;
exports.getAllSideItemsBySideGroupId = getAllSideItemsBySideGroupId;
exports.getActiveRestaurantMenuCategoriesByRestaurantId = getActiveRestaurantMenuCategoriesByRestaurantId;
exports.getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId = getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId;
exports.copySideGroupToSiblingItemsOfItem = copySideGroupToSiblingItemsOfItem;
exports.getActivityChart = getActivityChart;
exports.getItemsByRestaurantId = getItemsByRestaurantId;