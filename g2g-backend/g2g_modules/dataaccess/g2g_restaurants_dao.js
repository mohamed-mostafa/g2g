/**
 * The dataaccess methods of g2g
 */

var daoUtilities = require("./g2g_dao_utilities.js");



// calls the onSuccess with a list of restaurant objects
//calls the onFailure with an err object in case of technical error
var getAllActiveRestaurantsByZipCode = function (zipCode, onSuccess, onFailure, includeLogos) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
		    onFailure(err);
		} else {
			
			// execute the query
			// restaurant joined with restaurant zip code. should return one record per restaurant since restaurant_zip_code is one-to-many with restaurant, and it has restaurant_id and zip code as primary keys, so a zip code will never repeat for a restaurant, and we query by zip code
			connection.query('SELECT * FROM g2g.restaurant INNER JOIN g2g.restaurant_zip_code ON g2g.restaurant.id = g2g.restaurant_zip_code.restaurant_id WHERE g2g.restaurant.active = 1 and g2g.restaurant_zip_code.zip_code = ? ORDER BY g2g.restaurant.order, g2g.restaurant.name', [zipCode], function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to load all restaurants by zip code");
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list
					var restaurants = {restaurants:[]};
					// no error is thrown, iterate over the results and create an object for each row and append it to the results list
					for (var i = 0; i < rows.length; i++) {
						if (includeLogos) {
							var restaurant = {
									id: rows[i].id,
									name: rows[i].name,
									location: rows[i].location,
									cuisine: rows[i].cuisine,
									logo: rows[i].logo,
									streetAddress: rows[i].street_address,
									city: rows[i].city,
									state: rows[i].state,
									zipCode: rows[i].zip_code,
									partner: rows[i].partner,
									workingHours: rows[i].working_hours,
									deliveryCharge: rows[i].delivery_charge,
									order: rows[i].order
							};
							restaurants.restaurants.push(restaurant);
						} else {
							var restaurant = {
									id: rows[i].id,
									name: rows[i].name,
									location: rows[i].location,
									cuisine: rows[i].cuisine,
									streetAddress: rows[i].street_address,
									city: rows[i].city,
									state: rows[i].state,
									zipCode: rows[i].zip_code,
									partner: rows[i].partner,
									workingHours: rows[i].working_hours,
									deliveryCharge: rows[i].delivery_charge,
									order: rows[i].order
									};
							restaurants.restaurants.push(restaurant);
						}
					}
					// end the connection
					connection.end();
					
					// call the callback function provided by the caller, and give it the response
					onSuccess(restaurants);
				}
			});
		}
	});
};

//calls the onSuccess with a list of objects
//calls the onFailure with an err object in case of technical error
var getAllActiveRestaurantsLogos = function (onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
		    onFailure(err);
		} else {
			
			// execute the query
			// restaurant joined with restaurant zip code. should return one record per restaurant since restaurant_zip_code is one-to-many with restaurant, and it has restaurant_id and zip code as primary keys, so a zip code will never repeat for a restaurant, and we query by zip code
			connection.query('SELECT id, logo FROM g2g.restaurant WHERE g2g.restaurant.active = 1', [], function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to load all logos");
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list
					var logosMap = {};
					// no error is thrown, iterate over the results and create an object for each row and append it to the results list
					for (var i = 0; i < rows.length; i++) {
						logosMap[rows[i].id] = rows[i].logo;
					}
					// end the connection
					connection.end();
					
					// call the callback function provided by the caller, and give it the response
					onSuccess(logosMap);
				}
			});
		}
	});
};

//calls the onSuccess with a list of restaurant objects
//calls the onFailure with an err object in case of technical error
var getAllRestaurants = function (onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
		    onFailure(err);
		} else {
			// execute the query
			// restaurant joined with restaurant zip code. should return one record per restaurant since restaurant_zip_code is one-to-many with restaurant, and it has restaurant_id and zip code as primary keys, so a zip code will never repeat for a restaurant, and we query by zip code
			connection.query('SELECT * FROM g2g.restaurant ORDER BY g2g.restaurant.order, g2g.restaurant.name', function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to load all restaurants");
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list
					var restaurants = [];
					// no error is thrown, iterate over the results and create an object for each row and append it to the results list
					for (var i = 0; i < rows.length; i++) {
						var restaurant = {
								id: rows[i].id,
								name: rows[i].name,
								location: rows[i].location,
								cuisine: rows[i].cuisine,
								logo: rows[i].logo,
								streetAddress: rows[i].street_address,
								city: rows[i].city,
								state: rows[i].state,
								zipCode: rows[i].zip_code,
								partner: rows[i].partner,
								workingHours: rows[i].working_hours,
								deliveryCharge: rows[i].delivery_charge,
								active: rows[i].active,
								order: rows[i].order
								};
						restaurants.push(restaurant);
					}
					// end the connection
					connection.end();
					
					// call the callback function provided by the caller, and give it the response
					onSuccess(restaurants);
				}
			});
		}
	});
};

var getRestaurantById = function(restaurantId, onSuccess, onFailure) {
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);(err);
		} else {
			
			// execute the query
			connection.query('SELECT * FROM g2g.restaurant WHERE g2g.restaurant.id = ?', [restaurantId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to getRestaurantById");
					console.log(err);
					onFailure(err);
				} else {
					if (rows.length > 0) {
						var restaurant = {
								id: rows[0].id,
								name: rows[0].name,
								location: rows[0].location,
								cuisine: rows[0].cuisine,
								logo: rows[0].logo,
								streetAddress: rows[0].street_address,
								city: rows[0].city,
								state: rows[0].state,
								zipCode: rows[0].zip_code,
								partner: rows[0].partner,
								workingHours: rows[0].working_hours,
								deliveryCharge: rows[0].delivery_charge,
								active: rows[0].active,
								order: rows[0].order
								};
						// end the connection
						connection.end();
						
						// call the callback function provided by the caller, and give it the response
						onSuccess(restaurant);
					} else {
						onSuccess(null);
					}
				}
			});
		}
	});
};

var getNumberOfOrdresPerRestaurants = function (onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);(err);
		} else {
			
			// execute the query
			connection.query('SELECT restaurant.name, count(order.id) as orders_count FROM g2g.restaurant LEFT OUTER JOIN g2g.order ON g2g.order.restaurant_id = g2g.restaurant.id WHERE g2g.restaurant.active = 1 GROUP BY g2g.order.restaurant_id', [], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to load getNumberOfOrdresPerRestaurants");
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list
					var list = [];
					// no error is thrown, iterate over the results and create an object for each row and append it to the results list
					for (var i = 0; i < rows.length; i++) {
						
						list.push({name: rows[i].name, count: rows[i].orders_count});
					}
					// end the connection
					connection.end();
					
					// call the callback function provided by the caller, and give it the response
					onSuccess(list);
				}
			});
		}
	});
};


// calls the onSuccess with a list of restaurant menu category objects
//calls the onFailure with an err object in case of technical error
var getActiveRestaurantMenuCategoriesByRestaurantId = function (restaurantId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);(err);
		} else {
			
			// execute the query
			connection.query('SELECT * FROM g2g.restaurant_menu_category WHERE active = 1 and restaurant_id = ? ORDER BY g2g.restaurant_menu_category.order, g2g.restaurant_menu_category.name', [restaurantId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to load restaurantMenuCategories of restaurant " + restaurantId);
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list
					var restaurantMenuCategories = {restaurantMenuCategories:[]};
					// no error is thrown, iterate over the results and create an object for each row and append it to the results list
					for (var i = 0; i < rows.length; i++) {
						var menuCategory = {
								id: rows[i].id,
								name: rows[i].name,
								description: rows[i].description,
								order: rows[i].order
								};
						restaurantMenuCategories.restaurantMenuCategories.push(menuCategory);
					}
					// end the connection
					connection.end();
					
					// call the callback function provided by the caller, and give it the response
					onSuccess(restaurantMenuCategories);
				}
			});
		}
	});
};


//calls the onSuccess with a list of restaurant menu category objects
//calls the onFailure with an err object in case of technical error
var getAllCategoriesByRestaurantId = function (restaurantId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);(err);
		} else {
			
			// execute the query
			connection.query('SELECT * FROM g2g.restaurant_menu_category WHERE restaurant_id = ?  ORDER BY g2g.restaurant_menu_category.order, g2g.restaurant_menu_category.name', [restaurantId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to load restaurantMenuCategories of restaurant " + restaurantId);
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list
					var restaurantMenuCategories = [];
					// no error is thrown, iterate over the results and create an object for each row and append it to the results list
					for (var i = 0; i < rows.length; i++) {
						var menuCategory = {
								id: rows[i].id,
								name: rows[i].name,
								description: rows[i].description,
								active: rows[i].active,
								order: rows[i].order
								};
						restaurantMenuCategories.push(menuCategory);
					}
					// end the connection
					connection.end();
					
					// call the callback function provided by the caller, and give it the response
					onSuccess(restaurantMenuCategories);
				}
			});
		}
	});
};


//calls the onSuccess with a list of restaurant menu category item objects
//calls the onFailure with an err object in case of technical error
var getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId = function(restaurantMenuCategoryId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.restaurant_menu_category_item WHERE active = 1 and restaurant_menu_category_id = ?  ORDER BY g2g.restaurant_menu_category_item.order, g2g.restaurant_menu_category_item.name', [restaurantMenuCategoryId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to load restaurantMenuCategoryItems of restaurantMenuCategory " + restaurantMenuCategoryId);
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list of items
					var restaurantMenuCategoryItems = {restaurantMenuCategoryItems:[]};
					if (rows.length == 0) {
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(restaurantMenuCategoryItems);
					} else {
						var itemsIds = [];
						for (var i = 0; i < rows.length; i++) {
							var restaurantMenuCategoryItem = {
									id: rows[i].id,
									name: rows[i].name,
									description: rows[i].description,
									price: rows[i].price,
									active: rows[i].active,
									order: rows[i].order,
									sideGroups: []
							};
							itemsIds.push(restaurantMenuCategoryItem.id);
							restaurantMenuCategoryItems.restaurantMenuCategoryItems.push(restaurantMenuCategoryItem);
						} // end iteration over items
						
						// get the sides of all the items
						connection.query('SELECT * FROM g2g.restaurant_menu_category_item_side_group WHERE active = true AND restaurant_menu_category_item_id IN (?) ORDER BY g2g.restaurant_menu_category_item_side_group.order, g2g.restaurant_menu_category_item_side_group.name', [itemsIds], function(sideGroupsErr, sideGroupRows) {
							// if an error is thrown, end the connection and throw an error
							if (sideGroupsErr) {
								// end the connection
								connection.end();
								console.log("An error occurred while trying to load side groups of items " + itemsIds);
								console.log(sideGroupsErr);
								onFailure(sideGroupsErr);
							} else {
								// no error is thrown, iterate over the results and create an object for each row and append it to the results list
								if (sideGroupRows.length == 0) { // none of the items have groups
									// end the connection
									connection.end();
									// call the callback function provided by the caller, and give it the response
									onSuccess(restaurantMenuCategoryItems);
								} else {
									var sideGroupsIds = [];
									for (var j = 0; j < sideGroupRows.length; j++) {
										// add it to the menu item's group
										var sideGroup = {
											id: sideGroupRows[j].id,
											name: sideGroupRows[j].name,
											maximumAllowedItems: sideGroupRows[j].maximum_allowed_items,
											order: sideGroupRows[j].order,
											sideGroupItems: []
										};
										sideGroupsIds.push(sideGroup.id);
										// add the group to its corresponding item
										for (var itemIndex = 0; itemIndex < restaurantMenuCategoryItems.restaurantMenuCategoryItems.length; itemIndex++) {
											if (sideGroupRows[j].restaurant_menu_category_item_id == restaurantMenuCategoryItems.restaurantMenuCategoryItems[itemIndex].id) {
												restaurantMenuCategoryItems.restaurantMenuCategoryItems[itemIndex].sideGroups.push(sideGroup);
												break;
											}
										}
									}
									
									// find the sides of all the groups
									connection.query('SELECT * FROM g2g.side_group_item WHERE active = true AND restaurant_menu_category_item_side_group_id IN (?) ORDER BY g2g.side_group_item.order, g2g.side_group_item.name', [sideGroupsIds], function(sideItemsErr, sideItemRows) {
										// if an error is thrown, end the connection and throw an error
										if (sideItemsErr) {
											// end the connection
											console.log("An error occurred while trying to load side items of group " + sideGroupsIds);
											console.log(sideItemsErr);
											connection.end();
											onFailure(sideItemsErr);
										} else {
											for (var k = 0; k < sideItemRows.length; k++) {
												// add it to the menu item's group
												var sideItem = {
													id: sideItemRows[k].id,
													name: sideItemRows[k].name,
													price: sideItemRows[k].price,
													order: sideItemRows[k].order,
													description: sideItemRows[k].description != null ? sideItemRows[k].description : ""
												};
												// add the side to its corresponding group
												for (var itemIndex = 0; itemIndex < restaurantMenuCategoryItems.restaurantMenuCategoryItems.length; itemIndex++) {
													for (var groupIndex = 0; groupIndex < restaurantMenuCategoryItems.restaurantMenuCategoryItems[itemIndex].sideGroups.length; groupIndex++) {
														if (restaurantMenuCategoryItems.restaurantMenuCategoryItems[itemIndex].sideGroups[groupIndex].id == sideItemRows[k].restaurant_menu_category_item_side_group_id) {
															restaurantMenuCategoryItems.restaurantMenuCategoryItems[itemIndex].sideGroups[groupIndex].sideGroupItems.push(sideItem);
															break;
														}
													}
												}
											}
											// end the connection
											connection.end();
											// call the callback function provided by the caller, and give it the response
											onSuccess(restaurantMenuCategoryItems);
										}
									});
								}
							}
						});
					}
				}
			});
		}
	});
};


//calls the onSuccess with a list of restaurant menu category item objects
//calls the onFailure with an err object in case of technical error
var getAllItemsByCategoryId = function(restaurantMenuCategoryId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.restaurant_menu_category_item WHERE restaurant_menu_category_id = ? ORDER BY g2g.restaurant_menu_category_item.order, g2g.restaurant_menu_category_item.name', [restaurantMenuCategoryId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to load restaurantMenuCategoryItems of restaurantMenuCategory " + restaurantMenuCategoryId);
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list of items
					var restaurantMenuCategoryItems = [];
					if (rows.length == 0) {
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(restaurantMenuCategoryItems);
					} else {
						for (var i = 0; i < rows.length; i++) {
							var restaurantMenuCategoryItem = {
									id: rows[i].id,
									name: rows[i].name,
									description: rows[i].description,
									price: rows[i].price,
									active: rows[i].active,
									order: rows[i].order,
									sideGroups: []
							};
							restaurantMenuCategoryItems.push(restaurantMenuCategoryItem);
						} // end iteration over items
						
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(restaurantMenuCategoryItems);
					}
				}
			});
		}
	});
};

//calls the onSuccess with a list of restaurant menu category item objects
//calls the onFailure with an err object in case of technical error
var getAllItemsByRestaurantId = function(restaurantId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT g2g.restaurant.name restaurant, category.name category, item.name item, item.price price FROM g2g.restaurant_menu_category_item item, g2g.restaurant_menu_category category, g2g.restaurant WHERE restaurant.id = category.restaurant_id AND category.id = item.restaurant_menu_category_id AND g2g.restaurant.id = ?', [restaurantId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to load items of restaurant " + restaurantId);
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list of items
					var items = [];
					if (rows.length == 0) {
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(items);
					} else {
						for (var i = 0; i < rows.length; i++) {
							var item = {
									item: rows[i].item,
									category: rows[i].category,
									restaurant: rows[i].restaurant,
									price: rows[i].price,
							};
							items.push(item);
						} // end iteration over items
						
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(items);
					}
				}
			});
		}
	});
};


//calls the onSuccess with a list of restaurant menu category item objects
//calls the onFailure with an err object in case of technical error
var getAllSideGroupsByItemId = function(itemId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.restaurant_menu_category_item_side_group WHERE restaurant_menu_category_item_id = ? ORDER BY g2g.restaurant_menu_category_item_side_group.order, g2g.restaurant_menu_category_item_side_group.name', [itemId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to load side groups of item " + itemId);
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list of items
					var sideGroups = [];
					if (rows.length == 0) {
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(sideGroups);
					} else {
						for (var i = 0; i < rows.length; i++) {
							var sideGroup = {
									id: rows[i].id,
									name: rows[i].name,
									active: rows[i].active,
									maximumAllowedItems: rows[i].maximum_allowed_items,
									order: rows[i].order,
									sideGroupItems: []
							};
							sideGroups.push(sideGroup);
						} // end iteration over items
						
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(sideGroups);
					}
				}
			});
		}
	});
};


//calls the onSuccess with a list of restaurant menu category item objects
//calls the onFailure with an err object in case of technical error
var getAllSideItemsBySideGroupId = function(sideGroupId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.side_group_item WHERE restaurant_menu_category_item_side_group_id = ? ORDER BY g2g.side_group_item.order, g2g.side_group_item.name', [sideGroupId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to load side groups items of group " + sideGroupId);
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list of items
					var sideGroupItems = [];
					if (rows.length == 0) {
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(sideGroupItems);
					} else {
						for (var i = 0; i < rows.length; i++) {
							var sideGroupItem = {
									id: rows[i].id,
									name: rows[i].name,
									description: rows[i].description,
									price: rows[i].price,
									order: rows[i].order,
									active: rows[i].active
							};
							sideGroupItems.push(sideGroupItem);
						} // end iteration over items
						
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(sideGroupItems);
					}
				}
			});
		}
	});
};


//calls the onSuccess with a list of restaurant menu category item objects
//calls the onFailure with an err object in case of technical error
var getAllZipCodesByRestaurantId = function(restaurantId, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err);
			onFailure(err);
		} else {
			// execute the query
			connection.query('SELECT * FROM g2g.restaurant_zip_code WHERE restaurant_id = ?', [restaurantId], function(err, rows) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					// end the connection
					connection.end();
					console.log("An error occurred while trying to load zip codes of restaurant " + restaurantId);
					console.log(err);
					onFailure(err);
				} else {
					// initialize an empty list of items
					var zipCodes = [];
					if (rows.length == 0) {
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(zipCodes);
					} else {
						for (var i = 0; i < rows.length; i++) {
							var zipCode = rows[i].zip_code;
							zipCodes.push(zipCode);
						} // end iteration over items
						
						// end the connection
						connection.end();
						// call the callback function provided by the caller, and give it the response
						onSuccess(zipCodes);
					}
				}
			});
		}
	});
};



var createRestaurant = function (restaurant, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('INSERT INTO g2g.restaurant (name, location, cuisine, street_address, city, state, zip_code, partner, delivery_charge, active, working_hours, logo, g2g.restaurant.order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
					[restaurant.name, restaurant.location, restaurant.cuisine, restaurant.streetAddress, restaurant.city, restaurant.state, restaurant.zipCode, restaurant.partner, restaurant.deliveryCharge, 1, restaurant.workingHours, restaurant.logo, restaurant.order], function(err, result) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to add restaurant: " + JSON.stringify(restaurant));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					restaurant.id = result.insertId;
					onSuccess(restaurant);
				}
			});
		}
	});
};

var createCategory = function (category, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('INSERT INTO g2g.restaurant_menu_category (name, description, active, g2g.restaurant_menu_category.order, restaurant_id) VALUES (?, ?, ?, ?, ?)', [category.name, category.description, 1, category.order, category.restaurantId], function(err, result) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to add category: " + JSON.stringify(category));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					category.id = result.insertId;
					onSuccess(category);
				}
			});
		}
	});
};

var createItem = function (item, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('INSERT INTO g2g.restaurant_menu_category_item (name, description, price, active, g2g.restaurant_menu_category_item.order, restaurant_menu_category_id) VALUES (?, ?, ?, ?, ?, ?)', [item.name, item.description, item.price, 1, item.order, item.restaurantMenuCategoryId], function(err, result) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to add item: " + JSON.stringify(item));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					item.id = result.insertId;
					onSuccess(item);
				}
			});
		}
	});
};

var createSideGroup = function (sideGroup, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('INSERT INTO g2g.restaurant_menu_category_item_side_group (name, maximum_allowed_items, active, g2g.restaurant_menu_category_item_side_group.order, restaurant_menu_category_item_id) VALUES (?, ?, ?, ?, ?)', [sideGroup.name, sideGroup.maximumAllowedItems, 1, sideGroup.order, sideGroup.restaurantMenuCategoryItemId], function(err, result) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to add side group: " + JSON.stringify(sideGroup));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					sideGroup.id = result.insertId;
					onSuccess(sideGroup);
				}
			});
		}
	});
};

var createSideGroupItem = function (sideGroupItem, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('INSERT INTO g2g.side_group_item (name, description, price, active, g2g.side_group_item.order, restaurant_menu_category_item_side_group_id) VALUES (?, ?, ?, ?, ?, ?)', [sideGroupItem.name, sideGroupItem.description, sideGroupItem.price, 1, sideGroupItem.order, sideGroupItem.sideGroupId], function(err, result) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to add side group item: " + JSON.stringify(sideGroupItem));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					sideGroupItem.id = result.insertId;
					onSuccess(sideGroupItem);
				}
			});
		}
	});
};

var createRestaurantZipCode = function (restaurantId, zipCode, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('INSERT INTO g2g.restaurant_zip_code (restaurant_id, zip_code) VALUES (?, ?)', [restaurantId, zipCode], function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to add zip code: " + JSON.stringify(zipCode));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
};

var updateRestaurant = function (restaurant, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.restaurant SET name = ?, location = ?, cuisine = ?, street_address = ?, city = ?, state = ?, zip_code = ?, partner = ?, delivery_charge = ?, active = ?, working_hours = ?, logo = ?, g2g.restaurant.order = ? WHERE id = ?',
					[restaurant.name, restaurant.location, restaurant.cuisine, restaurant.streetAddress, restaurant.city, restaurant.state, restaurant.zipCode, restaurant.partner, restaurant.deliveryCharge, restaurant.active, restaurant.workingHours, restaurant.logo, restaurant.order, restaurant.id], function(err, result) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to update restaurant: " + JSON.stringify(restaurant));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
};

var updateCategory = function (category, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.restaurant_menu_category SET name = ?, description = ?, active = ?, g2g.restaurant_menu_category.order = ? WHERE id = ?', [category.name, category.description, category.active, category.order, category.id], function(err, result) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to update category: " + JSON.stringify(category));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
};

var updateItem = function (item, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.restaurant_menu_category_item SET name = ?, description = ?, price = ?, active = ?, g2g.restaurant_menu_category_item.order = ? WHERE id = ?', [item.name, item.description, item.price, item.active, item.order, item.id], function(err, result) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to update item: " + JSON.stringify(item));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
};

var updateSideGroup = function (sideGroup, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.restaurant_menu_category_item_side_group SET name = ?, maximum_allowed_items = ?, active = ?, g2g.restaurant_menu_category_item_side_group.order = ? WHERE id = ?', [sideGroup.name, sideGroup.maximumAllowedItems, sideGroup.active, sideGroup.order, sideGroup.id], function(err, result) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to update side group: " + JSON.stringify(sideGroup));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
};

var updateSideGroupItem = function (sideGroupItem, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.side_group_item SET name = ?, description = ?, price = ?, active = ?, g2g.side_group_item.order = ? WHERE id = ?', [sideGroupItem.name, sideGroupItem.description, sideGroupItem.price, sideGroupItem.active, sideGroupItem.order, sideGroupItem.id], function(err, result) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to update side group item: " + JSON.stringify(sideGroupItem));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
};

var updateRestaurantZipCode = function (restaurantId, oldZipCode, zipCode, onSuccess, onFailure) {
	// get a connection and open it
	var connection = daoUtilities.createConnection();
	connection.connect(function(err) {
		if (err) {
			console.log("An error occurred while trying to open a database connection");
			console.log(err); onFailure(err);
		} else {
			// execute the query
			connection.query('UPDATE g2g.restaurant_zip_code SET zip_code = ? WHERE restaurant_id = ? and zip_code = ?', [zipCode, restaurantId, oldZipCode], function(err, rows, fields) {
				// if an error is thrown, end the connection and throw an error
				if (err) {
					connection.end();
					console.log("An error occurred while trying to update zip code: " + JSON.stringify(zipCode));
					console.log(err); onFailure(err);
				} else {
					// end the connection
					connection.end();
					// call the callback function provided by the caller, and give it the response
					onSuccess();
				}
			});
		}
	});
};


// retrieval
exports.getAllActiveRestaurantsByZipCode = getAllActiveRestaurantsByZipCode;
exports.getActiveRestaurantMenuCategoriesByRestaurantId = getActiveRestaurantMenuCategoriesByRestaurantId;
exports.getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId = getActiveRestaurantMenuCategoryItemsByRestaurantMenuCategoryId;
exports.getAllRestaurants = getAllRestaurants;
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
//update
exports.updateRestaurant = updateRestaurant;
exports.updateCategory = updateCategory;
exports.updateItem = updateItem;
exports.updateSideGroup = updateSideGroup;
exports.updateSideGroupItem = updateSideGroupItem;
exports.updateRestaurantZipCode = updateRestaurantZipCode;

// reports
exports.getNumberOfOrdresPerRestaurants = getNumberOfOrdresPerRestaurants;