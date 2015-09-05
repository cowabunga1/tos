var https = require('https');
//var url = require('url');
var qs = require('querystring');
var fs = require('fs');

var tos_data = require( './output.json' );



function onError( err ) {
	if ( err ) {
		console.error( err );
	}
}

function processList( data ) {
	return data.reduce(function( sequence, house ) {
		return sequence.then( function() {
			return receiveCoordinates( house );
		})
		.then( function( newData) {
			console.log( 'Получены данные: ' + JSON.stringify( newData ) );
			house.yandex_api_data = newData.response.GeoObjectCollection.featureMember[0].GeoObject;
		})
		//.then( updateRecords )
		.catch( onError );
	}, Promise.resolve() );
}

function receiveCoordinates( house ) {
	

	//var textObj = JSON.stringify( inObj );
	//var crMessage = crypt.encrypt( textObj );

	return new Promise( function ( resolve, reject ) {
		console.log( '-------------------' );
		console.log( 'Щас получу координаты для домика:', house );

		var address = house.city + ' ' + house.name;

		console.log( 'Адрес домика: ' + address );

		var addressUrl = qs.escape( address );

		var options = {
		  hostname: 'geocode-maps.yandex.ru',
		  port: 443,
		  path: '/1.x/?format=json&results=1&geocode=' + addressUrl,
		  method: 'GET'
		};

		var req = https.request(options, function(res) {
		  //console.log("statusCode: ", res.statusCode);
		  //console.log("headers: ", res.headers);
		  var body = '';

		  res.on('data', function( resolveData ) {
		     body += resolveData;
		  });

		  res.on('end', function() {
		     return resolve( JSON.parse( body ) );
		  });
		});
		req.end();

		req.on( 'error', function( err ) {
		  return reject( err );
		});
	});
}

function writeFile( fileFullPath, data ) {
	return new Promise( function( resolve, reject ) {
		console.log( 'Произвожу запись в файл:' + fileFullPath );

		var str = JSON.stringify( data, null, " ") + '\n';

		fs.writeFile( fileFullPath, str, function ( err ) {
		  if ( err ) {
			//log.debug( 'Error on save: ' + fileFullPath, err );
			//throw err;
			return reject( err );
		  }

		  return resolve();
		  //log.debug( 'It\'s saved!: ' + fileFullPath );
		});
	});
}

processList( tos_data ).then( function() {
	console.log( 'Данные после обработки:' + JSON.stringify( tos_data ) );
	return writeFile( './output_with_coordinates.json', tos_data );
}).catch( onError );;

// console.log( addressUrl );


