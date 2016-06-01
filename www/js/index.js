var ENV = (function() {

    var localStorage = window.localStorage;

    return {
        dbName: 'locations',
        settings: {
            enabled:         localStorage.getItem('enabled')     || 'true',
            aggressive:      localStorage.getItem('aggressive')  || 'false',
            locationService: localStorage.getItem('locationService')  || 'ANDROID_DISTANCE_FILTER'
        },
        toggle: function(key) {
            var value    = localStorage.getItem(key),
                newValue = ((new String(value)) == 'true') ? 'false' : 'true';

            localStorage.setItem(key, newValue);
            return newValue;
        }
    };
})();

var app = {

    //map: undefined,

    location: undefined,

    path: undefined,

    //aggressiveEnabled: false,

    locations: [],
    isTracking: false,
    //postingEnabled: false,

    //postUrl: 'https://bgconsole.mybluemix.net/locations',

    //btnHome: undefined,
    //btnEnabled: undefined,
    //btnPace: undefined,
    //btnReset: undefined,

    initialize: function() {
        /*var salt = localStorage.getItem('salt');
        if (!salt) {
            salt = new Date().getTime();
            localStorage.setItem('salt', salt);
        }
        this.online = false;
        this.salt = salt;*/
        this.bindEvents();
        //google.maps.event.addDomListener(window, 'load', app.initializeMap);
    },

    /*initializeMap: function() {

        var mapOptions = {
          center: { lat: 37.3318907, lng: -122.0318303 },
          zoom: 12,
          zoomControl: false
        };

        var header = $('#header'),
            footer = $('#footer'),
            canvas = $('#map-canvas'),
            canvasHeight = window.innerHeight - header[0].clientHeight - footer[0].clientHeight;

        canvas.height(canvasHeight);
        canvas.width(window.clientWidth);

        app.map = new google.maps.Map(canvas[0], mapOptions);
    },*/

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);/*SI*/
        document.addEventListener('pause', this.onPause, false);/*SI*/
        document.addEventListener('resume', this.onResume, false);/*SI*/
        document.addEventListener("offline", this.onOffline, false);/*SI*/
        document.addEventListener("online", this.onOnline, false);/*SI*/

        /*this.btnHome    = $('#btn-home');
        this.btnReset   = $('#btn-reset');
        this.btnPace    = $('#btn-pace');
        this.btnEnabled = $('#btn-enabled');
        this.btnCollect = $('#btn-collect');
        this.ddService  = $('#dd-service .dropdown-menu');

        if (ENV.settings.aggressive == 'true') {
            this.btnPace.addClass('btn-danger');
        } else {
            this.btnPace.addClass('btn-success');
        }
        if (ENV.settings.enabled == 'true') {
            this.btnEnabled.addClass('btn-danger');
            this.btnEnabled[0].innerHTML = 'Stop';
        } else {
            this.btnEnabled.addClass('btn-success');
            this.btnEnabled[0].innerHTML = 'Start';
        }

        this.ddService.val(ENV.settings.locationService);

        this.btnHome.on('click', this.onClickHome);
        this.btnReset.on('click', this.onClickReset);
        this.btnPace.on('click', this.onClickChangePace);
        this.btnEnabled.on('click', this.onClickToggleEnabled);
        this.btnCollect.on('click', this.onCollectToggle);
        this.ddService.on('click', this.onServiceChange);*/
    },

    onDeviceReady: function() {
        //app.ready = true;
        //setInterval('app.nuevaPosicion()',30000);//add
        /*indexed(ENV.dbName).create(function (err) {
            if (err) {
                console.error(err);
            }
        });
        app.db = indexed(ENV.dbName);*/
        window.addEventListener('batterystatus', app.onBatteryStatus, false);
        app.configureBackgroundGeoLocation();
        backgroundGeoLocation.getLocations(app.postLocationsWasKilled);
        backgroundGeoLocation.watchLocationMode(app.onLocationCheck);
        /*if (app.online && app.wasNotReady) {
            app.postLocationsWasOffline()
        }*/
    },

    onLocationCheck: function (enabled) {
        /*if (app.isTracking && !enabled) {
            var showSettings = window.confirm('No location provider enabled. Should I open location setting?');
            if (showSettings === true) {
                backgroundGeoLocation.showLocationSettings();
            }
        }*/
    },

    onBatteryStatus: function(ev) {
        app.battery = {
            level: ev.level / 100,
            is_charging: ev.isPlugged
        };
        console.log('[DEBUG]: battery', app.battery);
    },

    /*onOnline: function() {
        console.log('Online');
        app.online = true;
        if (!app.ready) {
            app.wasNotReady = true;
            return;
        }
        app.postLocationsWasOffline();
    },

    onOffline: function() {
        console.log('Offline');
        app.online = false;
    },*/

    getDeviceInfo: function () {
        return {
            model: device.model,
            version: device.version,
            platform: device.platform,
            uuid: device.uuid//md5([device.uuid, this.salt].join())
        };
    },

    configureBackgroundGeoLocation: function() {
        var anonDevice = app.getDeviceInfo();

        var yourAjaxCallback = function(response) {
            backgroundGeoLocation.finish();
        };

        var callbackFn = function(location) {
            var data = {
                location: {
                    uuid: new Date().getTime(),
                    timestamp: location.time,
                    battery: app.battery,
                    coords: location,
                    service_provider: ENV.settings.locationService
                },
                device: anonDevice
            };
            console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
            $("#loc").append('<p> A)'+ location.latitude+','+location.longitude+'</p>')
            /*try {
                app.setCurrentLocation(location);
            } catch (e) {
                console.error('[ERROR]: setting location', e.message);
            }

            if (app.postingEnabled) {
                app.postLocation(data)
                .fail(function () {
                    app.persistLocation(data);
                })
                .always(function () {
                    yourAjaxCallback.call(this);
                });
            } else {
                yourAjaxCallback.call(this);
            }*/
        };

        var failureFn = function(err) {
            //console.log('BackgroundGeoLocation err', err);
            window.alert('BackgroundGeoLocation err: ' + JSON.stringify(err));
            $("#loc").append('<p> E) 0,0 </p>')
        };

        /*backgroundGeoLocation.onStationary(function(location) {
            if (!app.stationaryRadius) {
                app.stationaryRadius = new google.maps.Circle({
                    fillColor: '#cc0000',
                    fillOpacity: 0.4,
                    strokeOpacity: 0,
                    map: app.map
                });
            }
            var radius = (location.accuracy < location.radius) ? location.radius : location.accuracy;
            var center = new google.maps.LatLng(location.latitude, location.longitude);
            app.stationaryRadius.setRadius(radius);
            app.stationaryRadius.setCenter(center);
        });*/

        backgroundGeoLocation.configure(callbackFn, failureFn, {
            desiredAccuracy: 10,
            stationaryRadius: 50,
            distanceFilter: 50,
            locationTimeout: 30,
            notificationIcon: 'mappointer',
            notificationIconColor: '#FEDD1E',
            notificationTitle: 'Background tracking', // <-- android only, customize the title of the notification
            notificationText: 'Hola que hace',//ENV.settings.locationService, // <-- android only, customize the text of the notification
            activityType: 'AutomotiveNavigation',
            debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
            stopOnTerminate: false, // <-- enable this to clear background location settings when the app terminates
            locationService: backgroundGeoLocation.service[ENV.settings.locationService],
            fastestInterval: 5000,
            activitiesInterval: 10000
        });

        /*var settings = ENV.settings;

        if (settings.enabled == 'true') {
            app.startTracking();

            if (settings.aggressive == 'true') {
                backgroundGeoLocation.changePace(true);
            }
        }*/

        app.startTracking();
    },

    /*onClickHome: function () {
        var fgGeo = window.navigator.geolocation;

        fgGeo.getCurrentPosition(
          function(location) {
            var map     = app.map,
                coords  = location.coords,
                ll      = new google.maps.LatLng(coords.latitude, coords.longitude),
                zoom    = map.getZoom();

            map.setCenter(ll);
            if (zoom < 15) {
                map.setZoom(15);
            }
            app.setCurrentLocation(coords);
        },function(err) {
            console.log('Error occured. Maybe check permissions', err);
            window.alert('Error occured. Maybe check permissions');
        });
    },

    onCollectToggle: function(ev) {
        var postingEnabled,
            $el = $(this).find(':checkbox');
        app.postingEnabled = postingEnabled = !app.postingEnabled;
        $el.prop('checked', postingEnabled);
        if (postingEnabled) {
            window.alert('Anonymized data with your position, device model and battery level will be sent.');
        }
    },

    onServiceChange: function(ev) {
        var locationService = $(ev.target).text();

        ENV.settings.locationService = locationService;
        localStorage.setItem('locationService', locationService);
        if (app.isTracking) {
            app.stopTracking();
            app.configureBackgroundGeoLocation();
            app.startTracking();
        } else {
            app.configureBackgroundGeoLocation();
        }
    },

    onClickChangePace: function(value) {
        var btnPace = app.btnPace;

        btnPace.removeClass('btn-success');
        btnPace.removeClass('btn-danger');

        var isAggressive = ENV.toggle('aggressive');
        if (isAggressive == 'true') {
            btnPace.addClass('btn-danger');
            backgroundGeoLocation.changePace(true);
        } else {
            btnPace.addClass('btn-success');
            backgroundGeoLocation.changePace(false);
        }
    },

    onClickReset: function() {

        var locations = app.locations;
        for (var n=0,len=locations.length;n<len;n++) {
            locations[n].setMap(null);
        }
        app.locations = [];

        if (app.path) {
            app.path.setMap(null);
            app.path = undefined;
        }
    },

    onClickToggleEnabled: function(value) {
        var btnEnabled  = app.btnEnabled,
            isEnabled   = ENV.toggle('enabled');

        btnEnabled.removeClass('btn-danger');
        btnEnabled.removeClass('btn-success');

        if (isEnabled == 'true') {
            btnEnabled.addClass('btn-danger');
            btnEnabled[0].innerHTML = 'Stop';
            app.startTracking();
        } else {
            btnEnabled.addClass('btn-success');
            btnEnabled[0].innerHTML = 'Start';
            app.stopTracking();
        }
    },*/

    onPause: function() {
        console.log('- onPause');
        // app.stopPositionWatch();
    },

    onResume: function() {
        console.log('- onResume');
    },

    startTracking: function () {
        backgroundGeoLocation.start();
        /*app.isTracking = true;
        backgroundGeoLocation.isLocationEnabled(app.onLocationCheck);*/
    },

    stopTracking: function () {
        backgroundGeoLocation.stop();
        app.isTracking = false;
    },

    /*setCurrentLocation: function(location) {
        var map = app.map;

        if (!app.location) {
            app.location = new google.maps.Marker({
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 3,
                    fillColor: 'blue',
                    strokeColor: 'blue',
                    strokeWeight: 5
                }
            });
            app.locationAccuracy = new google.maps.Circle({
                fillColor: '#3366cc',
                fillOpacity: 0.4,
                strokeOpacity: 0,
                map: map
            });
        }
        if (!app.path) {
            app.path = new google.maps.Polyline({
                map: map,
                strokeColor: '#3366cc',
                fillOpacity: 0.4
            });
        }
        var latlng = new google.maps.LatLng(Number(location.latitude), Number(location.longitude));

        if (app.previousLocation) {
            var prevLocation = app.previousLocation;
            app.locations.push(new google.maps.Marker({
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 3,
                    fillColor: 'green',
                    strokeColor: 'green',
                    strokeWeight: 5
                },
                map: map,
                position: new google.maps.LatLng(prevLocation.latitude, prevLocation.longitude)
            }));
        } else {
            map.setCenter(latlng);
            if (map.getZoom() < 15) {
                map.setZoom(15);
            }
        }

        app.location.setPosition(latlng);
        app.locationAccuracy.setCenter(latlng);
        app.locationAccuracy.setRadius(location.accuracy);

        app.path.getPath().push(latlng);
        app.previousLocation = location;
    },

    /*postLocationsWasOffline: function () {
        app.db.find({}, function (err, locations) {
            if (err) {
                console.error('[ERROR]: while retrieving location data', err);
            }

            (function postOneByOne (locations) {
                var location = locations.pop();
                if (!location) {
                    return;
                }
                app.postLocation(location)
                .done(function () {
                    app.db.delete({ _id: location._id }, function (err) {
                        if (err) {
                            console.error('[ERROR]: deleting row %s', location._id, err);
                        }
                        postOneByOne(locations);
                    });
                });
            })(locations || []);
        });
    },*/

    postLocation: function (data) {
        /*return $.ajax({
            url: app.postUrl,
            type: 'POST',
            data: JSON.stringify(data),
            // dataType: 'html',
            contentType: 'application/json'
        });*/
    },

    /*persistLocation: function (location) {
        app.db.insert(location, function (err) {
            if (err) {
                console.error('[ERROR]: inserting location data', err);
            }
        });
    },*/

    postLocationsWasKilled: function (locations) {
        var anonDevice, filtered;

        filtered = [].filter.call(locations, function(location) {
            return location.debug === false;
        });

        if (!filtered || filtered.length === 0) {
            return;
        }

        anonDevice = app.getDeviceInfo();

        (function postOneByOne (locations) {
            var location = locations.pop();
            if (!location) {
                return;
            }
            var data = {
                location: {
                    uuid: new Date().getTime(),
                    timestamp: location.time,
                    battery: {},
                    coords: location,
                    service_provider: 'SQLITE'
                },
                device: anonDevice
            };

            app.postLocation(data).done(function () {
                backgroundGeoLocation.deleteLocation(location.locationId,
                    function () {
                        console.log('[DEBUG]: location %s deleted', location.locationId);
                        postOneByOne(locations);
                    },
                    function (err) {
                        if (err) {
                            console.error('[ERROR]: deleting locationId %s', location.locationId, err);
                        }
                        postOneByOne(locations);
                    }
                );
            });
        })(filtered || []);
    }/*,

    onSuccessA: function(position) {
        //app.enviarUbicacion(position.coords.latitude, position.coords.longitude)
        $("#loc").append('<p>'+ position.coords.latitude+','+position.coords.longitude+'</p>')
    },

    onError: function(position) {
        //app.enviarUbicacion(0, 0)
        $("#loc").append('<p> error </p>')
    },

    nuevaPosicion: function() {
        try{
            navigator.geolocation.getCurrentPosition(app.onSuccessA, app.onError, { maximumAge: 3000, timeout: 15000, enableHighAccuracy: true });
        }catch(er){
            $("#log").append('<p> '+er+' </p>')
        }
    },

    fechaHoraSis: function() {
        var dt = new Date();
        var fech = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate()+' '+dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds();
        return fech;
    }, 

    enviarUbicacion: function() {
        var urlP = "http://gpsroinet.avanza.pe/mobile_controler/";
        var usu = 14;
        var fec = app.fechaHoraSis();
        $.ajax({
            type: 'POST',
            dataType: 'json', 
            data: {usu:usu, x:x, y:y, fec:fec},
            beforeSend : function (){   },
            url: urlP+"enviarUbicacion2",
            success : function(data){ },
            error: function(data){
                nuevaPosicion();
            }
        });
    }*/

};

app.initialize();
