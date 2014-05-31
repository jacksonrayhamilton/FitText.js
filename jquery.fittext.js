/*global jQuery, _ */
/*!
 * FitText.js "Jackson's Fork" 1.3
 *
 * Copyright 2011, Dave Rupert http://daverupert.com
 * Copyright 2013, Jackson Ray Hamilton http://www.jacksonrayhamilton.com
 * Released under the WTFPL license
 * http://sam.zoy.org/wtfpl/
 */

;(function( $ ) {

	$.fn.fitText = function fitText( options ) {

		var settings, lengthFn, otherLengthFn;

		settings = $.extend({

			// Make the font-size equal to dimensionValue * compression.
			compression	: 1.0,

			// Resize according to this dimension.
			dimension	: 'width',

			// Manually-specifies the container to draw the dimension from.
			container	: null,

			// If true, also set the line-height to be the height of the
			// container. Useful for pseudo-vertically-centering text.
			//
			// Can also be a function that returns a string value, such as
			// "15px", to be applied to the element's CSS.
			lineHeight	: false,

			// The ratio at which the font should be resized by the other
			// dimension. (If the dimension is height and your width becomes
			// slim, the font will get squished horizontally. This fixes that by
			// allowing you to set an arbitrary maximal ratio up to which the
			// text will not be squished.)
			ratio		: null,

			// Speeds up the process of artificially shrinking text in the case
			// of the ratio being overstepped when the other dimension is larger
			// than the primary. Bigger is faster.
			shrinkRate	: 1.0,

			minFontSize	: Number.NEGATIVE_INFINITY,
			maxFontSize	: Number.POSITIVE_INFINITY

		}, options);

		$.each( settings, function (key, value) {
			if ( (key === 'minFontSize' || key === 'maxFontSize') &&
					typeof value === 'string' ) {
				settings[key] = parseFloat(value);
			}
		});

		if ( settings.dimension === 'height' ) {
			lengthFn = $.prototype.height;
			otherLengthFn = $.prototype.width;
		} else {
			lengthFn = $.prototype.width;
			otherLengthFn = $.prototype.height;
		}

		return this.each(function () {

			var $this, $container, cssFn;

			$this = $(this);

			// Use a specified container, otherwise use the selected element.
			if ( settings.container ) {
				$container = settings.container;
			} else {
				$container = $this;
			}

			// If lineHeight is `true` then use the container's height.
			if ( settings.lineHeight === true ) {
				cssFn = function cssFn( fontSize ) {
					$this.css({
						'font-size'		: fontSize,
						'line-height'	: $container.height() + 'px'
					});
				};
			}
			// If lineHeight is a function then use the function's return
			// result.
			else if ( typeof settings.lineHeight === 'function' ) {
				cssFn = function cssFn( fontSize ) {
					$this.css({
						'font-size'		: fontSize,
						'line-height'	: settings.lineHeight($container)
					});
				};
			}
			// Default, just resize the font.
			else {
				cssFn = function cssFn( fontSize ) {
					$this.css( 'font-size', fontSize );
				};
			}

			// Function that handles resizing.
			var resizer = function resizer() {

				var length = lengthFn.call( $container );

				if ( settings.ratio ) {
					var other = otherLengthFn.call( $container );
					var ratio = length / other;
					if ( ratio > settings.ratio ) {
						// If the other dimension is larger than the one you are
						// measuring then the font will grow
						// recursively. Therefore you must gradually shrink it
						// proportional to how far you overstepped the ratio.  A
						// shrinkRate can also be applied to speed this up
						// because certain proportions will shrink very slowly.
						if ( other > length ) {
							length *= 1 - (settings.shrinkRate * (ratio - settings.ratio));
						}
						// Otherwise if the other dimension is smaller then it
						// can safely be used as the length. The font will now
						// be resized according to the other dimension instead.
						else {
							length = other;
						}
					}
				}

				// Bound the font size by the min and max sizes.
				var fontSize = Math.max(
					Math.min(
						length * settings.compression,
						settings.maxFontSize),
					settings.minFontSize);

				cssFn(fontSize);
			};

			// Call once to set.
			resizer();

			// Resize on page resize.
			$( window ).on( 'resize.fittext orientationchange.fittext', resizer );
		});

	};

})( jQuery );
