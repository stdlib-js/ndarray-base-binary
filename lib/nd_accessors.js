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

// MODULES //

var numel = require( '@stdlib/ndarray-base-numel' );
var vind2bind = require( '@stdlib/ndarray-base-vind2bind' );


// VARIABLES //

var MODE = 'throw';


// MAIN //

/**
* Applies a binary callback to elements in n-dimensional input ndarrays and assigns results to elements in an equivalently shaped output ndarray.
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
* var shape = [ 6, 2 ];
*
* // Define the array strides:
* var sx = [ 2, 1 ];
* var sy = [ 2, 1 ];
* var sz = [ 2, 1 ];
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
* binarynd( x, y, z, fcn );
*
* console.log( copy( z.data ) );
* // => [ 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0 ]
*/
function binarynd( x, y, z, fcn ) {
	var xbuf;
	var ybuf;
	var zbuf;
	var ordx;
	var ordy;
	var ordz;
	var xget;
	var yget;
	var zset;
	var len;
	var sh;
	var sx;
	var sy;
	var sz;
	var ox;
	var oy;
	var oz;
	var ix;
	var iy;
	var iz;
	var i;

	sh = x.shape;

	// Compute the total number of elements over which to iterate:
	len = numel( sh );

	// Cache references to the input and output ndarray data buffers:
	xbuf = x.data;
	ybuf = y.data;
	zbuf = z.data;

	// Cache references to the respective stride arrays:
	sx = x.strides;
	sy = y.strides;
	sz = z.strides;

	// Cache the indices of the first indexed elements in the respective ndarrays:
	ox = x.offset;
	oy = y.offset;
	oz = z.offset;

	// Cache the respective array orders:
	ordx = x.order;
	ordy = y.order;
	ordz = z.order;

	// Cache accessors:
	xget = x.accessors[ 0 ];
	yget = y.accessors[ 0 ];
	zset = z.accessors[ 1 ];

	// Iterate over each element based on the linear **view** index, regardless as to how the data is stored in memory...
	for ( i = 0; i < len; i++ ) {
		ix = vind2bind( sh, sx, ox, ordx, i, MODE );
		iy = vind2bind( sh, sy, oy, ordy, i, MODE );
		iz = vind2bind( sh, sz, oz, ordz, i, MODE );
		zset( zbuf, iz, fcn( xget( xbuf, ix ), yget( ybuf, iy ) ) );
	}
}


// EXPORTS //

module.exports = binarynd;
