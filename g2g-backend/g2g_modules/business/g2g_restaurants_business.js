/**
 * The business methods of g2g
 * Some methods are just 1-to-1 mapping for the dataaccess methods. If you want to interrupt the call to them, replace the callback function sent to them
 */

var g2gRestaurantsDao = require('../dataaccess/g2g_restaurants_dao.js');
var g2gConfigurationsBusiness = require('./g2g_configurations_business.js');

var restaurantIsOpen = function(restaurant) {
	
	// restaurant.workingHours is in the format: 0000-0000|0000-0000|0000-0000|0000-0000|0000-0000|0000-0000|0000-0000
	var workingDays = restaurant.workingHours.split("|"); // should return an array of 7 items, sunday is at index 0
	var now = new Date();
	var dayOfWeek = now.getDay(); // 0 is sunday, 1 is monday, ... etc
	var hour = now.getHours().toString();
	var minute = now.getMinutes().toString();
	while(hour.length < 2) hour = "0" + hour;
	while(minute.length < 2) minute = "0" + minute;
	var nowTime = parseInt(hour + minute);
	
	var today = workingDays[dayOfWeek]; // should return a string in the format 0000-0000
	var openTime = parseInt(today.split("-")[0]); // should return a string in the format 0000
	var closeTime = parseInt(today.split("-")[1]); // should return a string in the format 0000
	if (closeTime > openTime) { // midnight is not in the middle (eg 1000 to 2100)
		if (nowTime >= openTime && nowTime < closeTime) { // if we're now between open and close time (open inclusive, close exclusive)
			return true;
		} else {
			return false;
		}
	} else if (closeTime < openTime) { // midnight is in the middle (e.g. 2100 to 400)
		if (nowTime >= openTime || nowTime < closeTime) { // if we're now after the open date in the same day, or before the close time in the next date (open inclusive, close exclusive)
			return true;
		} else {
			return false;
		}
	} else { // if both are equal, it is open
		return true;
	}
};


var getRestaurantById = function(restaurantId, onSuccess, onFailure) {
	g2gRestaurantsDao.getRestaurantById(restaurantId, onSuccess, onFailure);
};

// calls the onSuccess with an array of restaurant objects
var getAllActiveRestaurantsByZipCode = function (zipCode, onG2GClosed, onSuccess, onFailure, includeLogos) {
	
	g2gConfigurationsBusiness.g2gIsOnline(function() {
		// g2g is online, yes
		g2gRestaurantsDao.getAllActiveRestaurantsByZipCode(zipCode, function(restaurants) {
			for (var i = 0; i < restaurants.restaurants.length; i++) {
				restaurants.restaurants[i].isOpen = restaurantIsOpen(restaurants.restaurants[i]);
			}
			onSuccess(restaurants);
		}, onFailure, includeLogos);
	},function(startHour, endHour) {
		// g2g is not online, retrieve the restaurants anyway
		g2gRestaurantsDao.getAllActiveRestaurantsByZipCode(zipCode, function(restaurants) {
			for (var i = 0; i < restaurants.restaurants.length; i++) {
				restaurants.restaurants[i].isOpen = restaurantIsOpen(restaurants.restaurants[i]);
			}
			onG2GClosed(restaurants); // but respond in onG2GClosed
		}, onFailure, includeLogos);
	}, function(err) {
		// unable to detect if g2g is online or not
		onFailure(err);
	});
	
};

// calls the onSuccess with an array of restaurant menu category objects
var getActiveRestaurantMenuCategoriesByRestaurantId = function (restaurantId, onSuccess, onFailure) {
	g2gRestaurantsDao.getActiveRestaurantMenuCategoriesByRestaurantId(restaurantId, onSuccess, onFailure);
};

// calls the onSuccess with an array of restaurant menu category item objects
var getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId = function(restaurantMenuCategoryId, onSuccess, onFailure) {
	g2gRestaurantsDao.getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId(restaurantMenuCategoryId, onSuccess, onFailure);
};

var verifyZipCodeAvailabilityForRestaurant = function(restaurantId, zipCode, onSuccess, onFailure) {
	g2gRestaurantsDao.getAllActiveRestaurantsByZipCode(zipCode, function(restaurants) {
		var restaurantFound = false;
		for (var i = 0; i < restaurants.restaurants.length; i++) {
			if (restaurants.restaurants[i].id == restaurantId) {
				restaurantFound = true;
				break;
			}
		}
		onSuccess(restaurantFound);
	}, onFailure, false);
};

var getAllActiveRestaurantsLogos = function(onSuccess, onFailure) {
	g2gRestaurantsDao.getAllActiveRestaurantsLogos(onSuccess, onFailure);
};

var getAllRestaurants = function(onSuccess, onFailure) {
	g2gRestaurantsDao.getAllRestaurants(function(restaurants) {
		for (var i = 0; i < restaurants.length; i++) {
			restaurants[i].isOpen = restaurantIsOpen(restaurants[i]);
		}
		onSuccess(restaurants);
	}, onFailure);
};

var getActivityChart = function(onSuccess, onFailure) {
	g2gRestaurantsDao.getNumberOfOrdresPerRestaurants(onSuccess, onFailure);
};

var getAllCategoriesByRestaurantId = function(restaurantId, onSuccess, onFailure) {
	g2gRestaurantsDao.getAllCategoriesByRestaurantId(restaurantId, onSuccess, onFailure);
};

var getAllItemsByCategoryId = function(categoryId, onSuccess, onFailure) {
	g2gRestaurantsDao.getAllItemsByCategoryId(categoryId, onSuccess, onFailure);
};

var getAllSideGroupsByItemId = function(itemId, onSuccess, onFailure) {
	g2gRestaurantsDao.getAllSideGroupsByItemId(itemId, onSuccess, onFailure);
};

var getAllSideItemsBySideGroupId = function(sideGroupId, onSuccess, onFailure) {
	g2gRestaurantsDao.getAllSideItemsBySideGroupId(sideGroupId, onSuccess, onFailure);
};

var getAllZipCodesByRestaurantId = function(restaurantId, onSuccess, onFailure) {
	g2gRestaurantsDao.getAllZipCodesByRestaurantId(restaurantId, onSuccess, onFailure);
};
var getAllItemsByRestaurantId = function(restaurantId, onSuccess, onFailure) {
	g2gRestaurantsDao.getAllItemsByRestaurantId(restaurantId, onSuccess, onFailure);
};

var createRestaurant = function(restaurant, onSuccess, onFailure) {
	g2gRestaurantsDao.createRestaurant(restaurant, onSuccess, onFailure);
};
var createCategory = function(category, onSuccess, onFailure) {
	g2gRestaurantsDao.createCategory(category, onSuccess, onFailure);
};
var createItem = function(item, onSuccess, onFailure) {
	g2gRestaurantsDao.createItem(item, onSuccess, onFailure);
};
var createSideGroup = function(sideGroup, onSuccess, onFailure) {
	g2gRestaurantsDao.createSideGroup(sideGroup, onSuccess, onFailure);
};
var createSideGroupItem = function(sideGroupItem, onSuccess, onFailure) {
	g2gRestaurantsDao.createSideGroupItem(sideGroupItem, onSuccess, onFailure);
};
var createRestaurantZipCode = function(restaurantId, zipCode, onSuccess, onFailure) {
	g2gRestaurantsDao.createRestaurantZipCode(restaurantId, zipCode, onSuccess, onFailure);
};

var updateRestaurant = function(restaurant, onSuccess, onFailure) {
	g2gRestaurantsDao.updateRestaurant(restaurant, onSuccess, onFailure);
};
var updateCategory = function(category, onSuccess, onFailure) {
	g2gRestaurantsDao.updateCategory(category, onSuccess, onFailure);
};
var updateItem = function(item, onSuccess, onFailure) {
	g2gRestaurantsDao.updateItem(item, onSuccess, onFailure);
};
var updateSideGroup = function(sideGroup, onSuccess, onFailure) {
	g2gRestaurantsDao.updateSideGroup(sideGroup, onSuccess, onFailure);
};
var updateSideGroupItem = function(sideGroupItem, onSuccess, onFailure) {
	g2gRestaurantsDao.updateSideGroupItem(sideGroupItem, onSuccess, onFailure);
};
var updateRestaurantZipCode = function(restaurantId, zipCode, onSuccess, onFailure) {
	g2gRestaurantsDao.updateRestaurantZipCode(restaurantId, zipCode, onSuccess, onFailure);
};
var copySideGroupToSiblingItemsOfItem = function(sideGroup, restaurantMenuCategoryId, restaurantMenuCategoryItemIds, onSuccess, onFailure) {
	// we have a full side group object, and an item id, and a category id
	
	// some flags to be used to call the onSuccess
	var counter =  {
		numberOfGroupsToBeCreated: 0,
		numberOfItemsToBeCreated: 0,
		numberOfGroupsActuallyCreated: 0,
		numberOfItemsActuallyCreated: 0
	};
	
	//1. Get the items of the side group
	getAllSideItemsBySideGroupId(sideGroup.id, function(sideGroupItems) {
		// if no items for the side groups we're copying, continue, we'll create empty groups for the items
		//2. get the category items
		getAllItemsByCategoryId(restaurantMenuCategoryId, function(items){
			// if there're no items, no need to do anything.
			if (items.length == 0) {
				onSuccess();
			}
			
			// filter the items that are not in the given list
			var tempItems = [];
			for (var i = 0; i < items.length; i++) {
				for (var j = 0; j < restaurantMenuCategoryItemIds.length; j++) {
					if (items[i].id == restaurantMenuCategoryItemIds[j]) {
						tempItems.push(items[i]);
					}
				}
			}
			items = tempItems;
			counter.numberOfGroupsToBeCreated = items.length; // a group for each item, 
			counter.numberOfItemsToBeCreated = sideGroupItems.length * (items.length); // all items of the input group should be created for each group
			//3. save the side group to each of the siblings, and save the items to it as well
			for (var i = 0; i < items.length; i++) {
				var currentItem = items[i];
				// set the item id of the group to the current item's id, then save it (with the same name and description and everything
				var newSideGroup = JSON.parse(JSON.stringify(sideGroup));;
				newSideGroup.restaurantMenuCategoryItemId = currentItem.id;
				copySideGroup(newSideGroup, sideGroupItems, counter, onSuccess, onFailure);
			}
		},
		function(err) {
			onFailure(err);
		});
	}, function(err) {
		onFailure(err);
	});
	
};

var copySideGroup = function(sideGroup, sideGroupItems, counter, onSuccess, onFailure) {
	createSideGroup(sideGroup, function(insertedSideGroup) {
		counter.numberOfGroupsActuallyCreated ++;
		// call the onSuccess only when all are created
		if (counter.numberOfItemsActuallyCreated == counter.numberOfItemsToBeCreated && counter.numberOfGroupsToBeCreated == counter.numberOfGroupsActuallyCreated) {
			onSuccess();
		}
		// when the side group is saved , save the side items to it
		for (var j = 0; j < sideGroupItems.length; j++) {
			var currentSideGroupItem = JSON.parse(JSON.stringify(sideGroupItems[j]));
			currentSideGroupItem.sideGroupId = insertedSideGroup.id;
			copySideGroupItem(currentSideGroupItem, counter, onSuccess, onFailure);
		}
	}, function(err) {
		onFailure(err);
	});
};

var copySideGroupItem = function(sideGroupItem, counter, onSuccess, onFailure) {
	createSideGroupItem(sideGroupItem, function(insertedSideGroupItem) {
		counter.numberOfItemsActuallyCreated ++;
		// call the onSuccess only when all are created
		if (counter.numberOfItemsActuallyCreated == counter.numberOfItemsToBeCreated && counter.numberOfGroupsToBeCreated == counter.numberOfGroupsActuallyCreated)
			onSuccess();

	}, function(err) {
		onFailure(err);
	});
};

// verification
exports.verifyZipCodeAvailabilityForRestaurant = verifyZipCodeAvailabilityForRestaurant;
exports.restaurantIsOpen = restaurantIsOpen;

// retrieval
exports.getAllActiveRestaurantsByZipCode = getAllActiveRestaurantsByZipCode;
exports.getAllRestaurants = getAllRestaurants;
exports.getActiveRestaurantMenuCategoriesByRestaurantId = getActiveRestaurantMenuCategoriesByRestaurantId;
exports.getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId = getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId;
exports.getAllCategoriesByRestaurantId = getAllCategoriesByRestaurantId;
exports.getAllItemsByCategoryId = getAllItemsByCategoryId;
exports.getAllSideGroupsByItemId = getAllSideGroupsByItemId;
exports.getAllSideItemsBySideGroupId = getAllSideItemsBySideGroupId;
exports.getAllZipCodesByRestaurantId = getAllZipCodesByRestaurantId;
exports.getRestaurantById = getRestaurantById;
exports.getAllActiveRestaurantsLogos = getAllActiveRestaurantsLogos;
exports.getAllItemsByRestaurantId = getAllItemsByRestaurantId;
// creation
exports.createRestaurant = createRestaurant;
exports.createCategory = createCategory;
exports.createItem = createItem;
exports.createSideGroup = createSideGroup;
exports.createSideGroupItem = createSideGroupItem;
exports.createRestaurantZipCode = createRestaurantZipCode;
// update
exports.updateRestaurant = updateRestaurant;
exports.updateCategory = updateCategory;
exports.updateItem = updateItem;
exports.updateSideGroup = updateSideGroup;
exports.updateSideGroupItem = updateSideGroupItem;
exports.updateRestaurantZipCode = updateRestaurantZipCode;
exports.copySideGroupToSiblingItemsOfItem = copySideGroupToSiblingItemsOfItem;

// reporting
exports.getActivityChart = getActivityChart;