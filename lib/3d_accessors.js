/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

// MAIN //

/**
* Applies a binary callback to elements in three-dimensional input ndarrays and assigns results to elements in an equivalently shaped output ndarray.
*
* @private
* @param {Object} x - object containing input ndarray meta data
* @param {string} x.dtype - data type
* @param {Collection} x.data - data buffer
* @param {NonNegativeIntegerArray} x.shape - dimensions
* @param {IntegerArray} x.strides - stride lengths
* @param {NonNegativeInteger} x.offset - index offset
* @param {string} x.order - specifies whether `x` is row-major (C-style) or column-major (Fortran-style)
* @param {Array<Function>} x.accessors - data buffer accessors
* @param {Object} y - object containing input ndarray meta data
* @param {string} y.dtype - data type
* @param {Collection} y.data - data buffer
* @param {NonNegativeIntegerArray} y.shape - dimensions
* @param {IntegerArray} y.strides - stride lengths
* @param {NonNegativeInteger} y.offset - index offset
* @param {string} y.order - specifies whether `y` is row-major (C-style) or column-major (Fortran-style)
* @param {Array<Function>} y.accessors - data buffer accessors
* @param {Object} z - object containing output ndarray meta data
* @param {string} z.dtype - data type
* @param {Collection} z.data - data buffer
* @param {NonNegativeIntegerArray} z.shape - dimensions
* @param {IntegerArray} z.strides - stride lengths
* @param {NonNegativeInteger} z.offset - index offset
* @param {string} z.order - specifies whether `z` is row-major (C-style) or column-major (Fortran-style)
* @param {Array<Function>} z.accessors - data buffer accessors
* @param {boolean} isRowMajor - boolean indicating if provided arrays are in row-major order
* @param {Callback} fcn - binary callback
* @returns {void}
*
* @example
* var toAccessorArray = require( '@stdlib/array-base-to-accessor-array' );
* var accessors = require( '@stdlib/array-base-accessors' );
* var copy = require( '@stdlib/array-base-copy' );
*
* function fcn( x, y ) {
*     return x + y;
* }
*
* // Create data buffers:
* var xbuf = toAccessorArray( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
* var ybuf = toAccessorArray( [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
* var zbuf = toAccessorArray( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
*
* // Define the shape of the input and output arrays:
* var shape = [ 3, 2, 2 ];
*
* // Define the array strides:
* var sx = [ 4, 2, 1 ];
* var sy = [ 4, 2, 1 ];
* var sz = [ 4, 2, 1 ];
*
* // Define the index offsets:
* var ox = 0;
* var oy = 0;
* var oz = 0;
*
* // Create the input and output ndarray-like objects:
* var x = {
*     'dtype': 'generic',
*     'data': xbuf,
*     'shape': shape,
*     'strides': sx,
*     'offset': ox,
*     'order': 'row-major',
*     'accessors': accessors( xbuf ).accessors
* };
* var y = {
*     'dtype': 'generic',
*     'data': ybuf,
*     'shape': shape,
*     'strides': sy,
*     'offset': oy,
*     'order': 'row-major',
*     'accessors': accessors( ybuf ).accessors
* };
* var z = {
*     'dtype': 'generic',
*     'data': zbuf,
*     'shape': shape,
*     'strides': sz,
*     'offset': oz,
*     'order': 'row-major',
*     'accessors': accessors( zbuf ).accessors
* };
*
* // Apply the binary function:
* binary3d( x, y, z, true, fcn );
*
* console.log( copy( z.data ) );
* // => [ 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0 ]
*/
function binary3d( x, y, z, isRowMajor, fcn ) {
	var xbuf;
	var ybuf;
	var zbuf;
	var xget;
	var yget;
	var zset;
	var dx0;
	var dx1;
	var dx2;
	var dy0;
	var dy1;
	var dy2;
	var dz0;
	var dz1;
	var dz2;
	var sh;
	var S0;
	var S1;
	var S2;
	var sx;
	var sy;
	var sz;
	var ix;
	var iy;
	var iz;
	var i0;
	var i1;
	var i2;

	// Note on variable naming convention: S#, dx#, dy#, dz#, i# where # corresponds to the loop number, with `0` being the innermost loop...

	// Extract loop variables for purposes of loop interchange: dimensions and loop offset (pointer) increments...
	sh = x.shape;
	sx = x.strides;
	sy = y.strides;
	sz = z.strides;
	if ( isRowMajor ) {
		// For row-major ndarrays, the last dimensions have the fastest changing indices...
		S0 = sh[ 2 ];
		S1 = sh[ 1 ];
		S2 = sh[ 0 ];
		dx0 = sx[ 2 ];                // offset increment for innermost loop
		dx1 = sx[ 1 ] - ( S0*sx[2] );
		dx2 = sx[ 0 ] - ( S1*sx[1] ); // offset increment for outermost loop
		dy0 = sy[ 2 ];
		dy1 = sy[ 1 ] - ( S0*sy[2] );
		dy2 = sy[ 0 ] - ( S1*sy[1] );
		dz0 = sz[ 2 ];
		dz1 = sz[ 1 ] - ( S0*sz[2] );
		dz2 = sz[ 0 ] - ( S1*sz[1] );
	} else { // order === 'column-major'
		// For column-major ndarrays, the first dimensions have the fastest changing indices...
		S0 = sh[ 0 ];
		S1 = sh[ 1 ];
		S2 = sh[ 2 ];
		dx0 = sx[ 0 ];                // offset increment for innermost loop
		dx1 = sx[ 1 ] - ( S0*sx[0] );
		dx2 = sx[ 2 ] - ( S1*sx[1] ); // offset increment for outermost loop
		dy0 = sy[ 0 ];
		dy1 = sy[ 1 ] - ( S0*sy[0] );
		dy2 = sy[ 2 ] - ( S1*sy[1] );
		dz0 = sz[ 0 ];
		dz1 = sz[ 1 ] - ( S0*sz[0] );
		dz2 = sz[ 2 ] - ( S1*sz[1] );
	}
	// Set the pointers to the first indexed elements in the respective ndarrays...
	ix = x.offset;
	iy = y.offset;
	iz = z.offset;

	// Cache references to the input and output ndarray buffers...
	xbuf = x.data;
	ybuf = y.data;
	zbuf = z.data;

	// Cache accessors:
	xget = x.accessors[ 0 ];
	yget = y.accessors[ 0 ];
	zset = z.accessors[ 1 ];

	// Iterate over the ndarray dimensions...
	for ( i2 = 0; i2 < S2; i2++ ) {
		for ( i1 = 0; i1 < S1; i1++ ) {
			for ( i0 = 0; i0 < S0; i0++ ) {
				zset( zbuf, iz, fcn( xget( xbuf, ix ), yget( ybuf, iy ) ) );
				ix += dx0;
				iy += dy0;
				iz += dz0;
			}
			ix += dx1;
			iy += dy1;
			iz += dz1;
		}
		ix += dx2;
		iy += dy2;
		iz += dz2;
	}
}


// EXPORTS //

module.exports = binary3d;
