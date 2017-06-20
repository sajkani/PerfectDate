$(document).ready(function() {
	// KS - Initialize Firebase
	var config = {
	  apiKey: "AIzaSyDwcSHlUcGR-WkLGizclGzfFnnig98aBew",
	  authDomain: "perfect-date-82efd.firebaseapp.com",
	  databaseURL: "https://perfect-date-82efd.firebaseio.com",
	  projectId: "perfect-date-82efd",
	  storageBucket: "perfect-date-82efd.appspot.com",
	  messagingSenderId: "942714245613"
	};
	firebase.initializeApp(config);

	// KS gracenote API 6n4cata848e7z3fha7nkgb77
	// NS gracenote API zephc9snecc3dpg2eh66m4ng
	// NM gracenote API mwe8tdv7qxnfckf89bjmeyab
	// KS google places API AIzaSyBsKJtUzYMWM6ZpYy_eVpnfRbE4gWQY-d8

	var recentMovie;
	var recentEvent;
	var recentRestaurant;
	var movieChosen;
	var movieAPIkey = "mwe8tdv7qxnfckf89bjmeyab";
	var database = firebase.database();
	var mapCenter;
	var movieObject;
	var restaurantObject;
	var eventObject;
	var map;
	var service;
	var infowindow;
	var marker;
	var zipCodeObject;
	var posLat;
	var posLng;
	var zipCode;

	database.ref('/movieList').once("value", function(snapshot) {
		var movieList = snapshot.val();
		var array = Object.keys(movieList);
		var lastIndex = array.length - 1;
		var lastKey = array[lastIndex];
		recentMovie = movieList[lastKey].movie;
	}, function(errorObject) {
		console.log("The read failed: " + errorObject.code);
	});

	database.ref('/eventList').once("value", function(snapshot) {
		var eventList = snapshot.val();
		var array = Object.keys(eventList);
		var lastIndex = array.length - 1;
		var lastKey = array[lastIndex];
		recentEvent = eventList[lastKey].event;
	}, function(errorObject) {
		console.log("The read failed: " + errorObject.code);
	});

	database.ref('/restaurantList').once("value", function(snapshot) {
		var restaurantList = snapshot.val();
		var array = Object.keys(restaurantList);
		var lastIndex = array.length - 1;
		var lastKey = array[lastIndex];
		recentRestaurant = restaurantList[lastKey].restaurant;
	}, function(errorObject) {
		console.log("The read failed: " + errorObject.code);
	});

	function initMap() {

		//geolocation to capture position
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				posLat = position.coords.latitude;
				posLng = position.coords.longitude;
				console.log(posLat);
				console.log(posLng);
				//reverse geocoding to obtain zip code
				var zipCodeURL = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + posLat + "," + posLng + "&sensor=true";
			  	//console.log(zipCodeURL);
				$.ajax({
					url: zipCodeURL,
					method: "GET"
				}).done(function(zipCodeResponse) {
					zipCodeObject = zipCodeResponse;
					zipCode = zipCodeObject.results[2].address_components[0].short_name;
					//console.log(zipCode);
					//console.log(zipCodeObject);
					//console.log(zipCodeObject.results["0"].address_components[7].long_name);
					mapCenter = new google.maps.LatLng(posLat,posLng);
					map = new google.maps.Map(document.getElementById("mapHolder"), {
						center: mapCenter,
						zoom: 13
					});
					var request = {
						location: mapCenter,
						radius: '1000',
						type: ['restaurant']
					};

					service = new google.maps.places.PlacesService(map);
					service.nearbySearch(request, callback);
				});
				var pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				console.log(pos);
			}, function() {
				handleLocationError(true, infoWindow, map.getCenter());
			});
		}
		else {
			// Browser doesn't support Geolocation
			handleLocationError(false, infoWindow, map.getCenter());
		}
	};

	function handleLocationError(browserHasGeolocation, infoWindow, pos) {
		infoWindow.setPosition(pos);
		infoWindow.setContent(browserHasGeolocation ?
													'Error: The Geolocation service failed.' :
													'Error: Your browser doesn\'t support geolocation.');
		infoWindow.open(map);
	};

	// Render results from google places api
	function callback(results, status) {
	    if (status === google.maps.places.PlacesServiceStatus.OK) {
	       	//console.log(results);
	       	restaurantObject = results;
	       	for (var i = 0; i < 4; i++) {
	       		var subsection = $("<div>");
	       		var restaurantName = $("<p>");
	       		var restaurantPrice = $("<p>");
	       		var restaurantRating = $("<p>");
	       		subsection.attr("id", "restaurantResult");
	       		subsection.addClass("restaurant");
	       		subsection.attr("data-name", results[i].name);
	       		restaurantName.html(results[i].name);
	       		restaurantPrice.html("Price Level: " + results[i].price_level + " out of 4");
	       		restaurantRating.html("Rating: " + results[i].rating + " / 5.0");
	       		subsection.append(restaurantName);
	       		subsection.append(restaurantPrice);
	       		subsection.append(restaurantRating);
	       		$("#restaurantList").append(subsection);
	       	};
	    };
	};

	initMap();

	// Gracenote API for movies near a certain zipcode, for today...
	$("#movieImage").on("click", function() {
		movieChosen = true;
		var date = moment().format("YYYY-MM-DD");
		var gracenoteQueryURL = "http://data.tmsapi.com/v1.1/movies/showings" + "?startDate=" + date + "&zip=" + zipCode + "&api_key=" + movieAPIkey;
		$.ajax({
			url: gracenoteQueryURL,
			method: "GET"
		}).done(function(gracenoteResponse) {
			movieObject = gracenoteResponse;
			//console.log(movieObject);

			for (var i = 0; i < gracenoteResponse.length; i++) {
				var subsection = $("<div>");
				var title = $("<p>");
				subsection.addClass("userChoice");
				subsection.attr("data-name", gracenoteResponse[i].title);
				title.html(gracenoteResponse[i].title);
				subsection.append(title);
				$("#movieEventHolder").append(subsection);
			};
		});
	});

	// when user clicks perfectButton, load recently chosen movie and event
	$("#perfectButton").on("click", function() {
		var movieSubsection = $("<div>");
		var eventSubsection = $("<div>");
		var movieIntro = $("<div>");
		var eventIntro = $("<div>");
		var movieTitle = $("<div>");
		var eventTitle = $("<div>");
		movieIntro.html("Recently chosen movie:");
		eventIntro.html("Recently chosen event:");
		movieTitle.html(recentMovie);
		movieTitle.addClass("userChoice");
		movieSubsection.append(movieIntro);
		movieSubsection.append(movieTitle);
		eventTitle.html(recentEvent);
		eventTitle.addClass("userChoice");
		eventSubsection.append(eventIntro);
		eventSubsection.append(eventTitle);
		$("#movieEventHolder").html(movieSubsection);
		$("#movieEventHolder").append(eventSubsection);

	});

	// Renders list of movies or events and data persistance for movies/ events...
	$(document).on("click", ".userChoice", function() {
		if (movieChosen) {
			for (var i = 0; i < movieObject.length; i++) {
				if( $(this).attr("data-name") === movieObject[i].title) {
					var subsection = $("<div>");
					var title = $("<div>");
					var timeTable = $("<table>");
					var goBack = $("<button>");
					subsection.addClass("panel panel-default");
					title.addClass("panel heading");
					timeTable.addClass("table");
					goBack.html("Want a different movie?");
					goBack.attr("id", "goBackButton");
					title.html(movieObject[i].title);
					subsection.append(title);
					for (var j = 0; j < movieObject[i].showtimes.length; j++) {
						var tableRow = $("<tr>");
						var time = $("<td>");
						var theater = $("<td>");
						time.html(moment(movieObject[i].showtimes[j].dateTime).format("h:mm A"));
						theater.html(movieObject[i].showtimes[j].theatre.name);
						tableRow.append(time);
						tableRow.append(theater);
						timeTable.append(tableRow);
					};
					subsection.append(timeTable);
					$("#movieEventHolder").html(subsection);
					$("#movieEventHolder").append(goBack);
					database.ref('/movieList').push( {
						movie: movieObject[i].title
					});
				}
			};
		}
		else {
			for (var prop in eventObject.events) {
				if( $(this).attr("data-name") === eventObject.events[prop].name.html) {
					var subsection = $("<div>");
					var title = $("<div>");
					var description = $("<div>");
					var goBack = $("<button>");
					goBack.html("Want a different event?");
					goBack.attr("id", "goBackButton");
					title.html(eventObject.events[prop].name.html);
					description.html(eventObject.events[prop].description.html);
					subsection.append(title);
					subsection.append(description);
					$("#movieEventHolder").html(subsection);
					$("#movieEventHolder").append(goBack);
					database.ref('/eventList').push( {
						event: eventObject.events[prop].name.html
					});
				};
			}
		}
	});

	// Allows user to return to movie list or event...
	$(document).on("click", "#goBackButton", function() {
		if (movieChosen) {
			$("#movieEventHolder").empty();
			for(var i = 0; i < movieObject.length; i++) {
				var subsection = $("<div>");
				var title = $("<p>");
				subsection.addClass("userChoice");
				subsection.attr("data-name", movieObject[i].title);
				title.html(movieObject[i].title);
				subsection.append(title);
				$("#movieEventHolder").append(subsection);
			};
		}
		else {
			$("#movieEventHolder").empty();
			var display = $("<div>");
			display.html("Displaying events in " + eventObject.location.augmented_location.city + ", " + eventObject.location.augmented_location.region);
			$("#movieEventHolder").html(display);
			for (var prop in eventObject.events) {
				//console.log( eventObject.events[prop].name.html );
				var subsection = $("<div>");
				var title = $("<div>");
				subsection.addClass("userChoice");
				subsection.attr("data-name", eventObject.events[prop].name.html);
				title.html(eventObject.events[prop].name.html);
				subsection.html(title);
				$("#movieEventHolder").append(subsection);
			}
		}
	});

	// Restaurant data persistance on click...
	$(document).on("click", ".restaurant", function() {
		for (var i = 0; i < restaurantObject.length; i++) {
			if ( $(this).attr("data-name") === restaurantObject[i].name) {
				var subsection = $("<div>");
	       		var restaurantName = $("<p>");
	       		var restaurantPrice = $("<p>");
	       		var restaurantRating = $("<p>");
	       		subsection.attr("id", "restaurantResult");
	       		subsection.addClass("restaurant");
	       		restaurantName.html(restaurantObject[i].name);
	       		restaurantPrice.html("Price Level: " + restaurantObject[i].price_level + " out of 4");
	       		restaurantRating.html("Rating: " + restaurantObject[i].rating + " / 5.0");
	       		subsection.append(restaurantName);
	       		subsection.append(restaurantPrice);
	       		subsection.append(restaurantRating);
	       		$("#restaurantList").html(subsection);
	       		database.ref('/restaurantList').push( {
	       			restaurant: restaurantObject[i].name,
	       			location: restaurantObject[i].vicinity
	       		});
			}
		}
	});

	// Event Brite API
	// Initial load of data when clicking event panel
	$("#eventImage").on("click", function() {
    	//var date = "&date_modified.keyword=this_week";
    	movieChosen = false;
    	var apiKey = "&token=WJ5ZSOV6TV56IC44E7EJ";
    	var eventBriteQueryURL = "https://www.eventbriteapi.com/v3/events/search/?location.address=" + zipCode + apiKey;
		//console.log(eventBriteQueryURL);
    	$.ajax({
    		url: eventBriteQueryURL,
    		method: "GET"
    	}).done(function(eventBriteResponse) {
    		eventObject = eventBriteResponse;
    		//console.log(eventObject);
    		var display = $("<div>");
    		display.html("Displaying events in " + eventObject.location.augmented_location.city + ", " + eventObject.location.augmented_location.region);
    		$("#movieEventHolder").html(display);
    		for (var prop in eventObject.events) {
    			//console.log( eventObject.events[prop].name.html );
    			var subsection = $("<div>");
    			var title = $("<div>");
    			subsection.addClass("userChoice");
    			subsection.attr("data-name", eventObject.events[prop].name.html);
    			title.html(eventObject.events[prop].name.html);
    			subsection.html(title);
    			$("#movieEventHolder").append(subsection);
    		}
		});
	});

	//location query function
	$('#zipCode').click(function(){
	    var zipCodeManual = $('#enteredZipCode').val();
	    //console.log(zipCode);
		//var enteredName = document.getElementById('enteredFormName').value.replace(' ', '+');
	    if (zipCodeManual.length != 5) {
	    	$('#movieEventHolder').html("Invalid zip code");
	    }
	    else {
	    	if (movieChosen) {
	    		var date = moment().format("YYYY-MM-DD");
	    		var gracenoteQueryURL = "http://data.tmsapi.com/v1.1/movies/showings" + "?startDate=" + date + "&zip=" + zipCodeManual + "&api_key=" + movieAPIkey;
	    		$.ajax({
	    			url: gracenoteQueryURL,
	    			method: "GET"
	    		}).done(function(gracenoteResponse) {
	    			movieObject = gracenoteResponse;
	    			//console.log(movieObject);

	    			for (var i = 0; i < gracenoteResponse.length; i++) {
	    				var subsection = $("<div>");
	    				var title = $("<p>");
	    				subsection.addClass("userChoice");
	    				subsection.attr("data-name", gracenoteResponse[i].title);
	    				title.html(gracenoteResponse[i].title);
	    				subsection.append(title);
	    				$("#movieEventHolder").append(subsection);
	    			};
	    		});
	    	}
			else {
			    //Ajax Request
			    var queryURL = "https://www.eventbriteapi.com/v3/events/search/?token=WJ5ZSOV6TV56IC44E7EJ&location.address=" + zipCodeManual;
			    $.ajax({
			    	url: queryURL,
			    	method: "GET"
			    }).done(function (eventResponse) {
			    	eventObject = eventResponse;
			    	var display = $("<div>");
			    	display.html("Displaying events around " + eventObject.location.augmented_location.city + ", " + eventObject.location.augmented_location.region);
			    	$("#movieEventHolder").html(display);
			    	for (var prop in eventObject.events) {
			    		var subsection = $("<div>");
			    		var title = $("<div>");
			    		subsection.addClass("userChoice");
			    		subsection.attr("data-name", eventObject.events[prop].name.html);
			    		title.html(eventObject.events[prop].name.html);
			    		subsection.html(title);
			    		$("#movieEventHolder").append(subsection);
			    	}
			    });
			}
		};
	});
});
