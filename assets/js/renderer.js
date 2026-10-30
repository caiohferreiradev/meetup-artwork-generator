/**
 * Canvas renderer for the meetup artwork.
 *
 * Landscape formats follow the reference layout (1920×1080): a header row
 * with two "block toolbar" boxes (WordPress logo + label, date + time), the
 * title inside a "selected block" frame, talks in monospace with speaker
 * photos on the right and logos at the bottom. Square, portrait and stories
 * formats stack the same pieces vertically.
 */
( function () {
	'use strict';

	const THEMES = {
		light: {
			bg: '#eff2fd',
			ink: '#1e1e1e',
			soft: '#3c434a',
			accent: '#3858e9',
			box: '#ffffff',
			boxBorder: '#1e1e1e',
			plusBg: '#1e1e1e',
			plusFg: '#ffffff',
			dots: [ 56, 88, 233 ],
			shadow: [ 56, 88, 233 ],
			shadowAlpha: [ 0.22, 0.08 ],
			avatarBorder: '#1e1e1e',
			initialsBg: '#3858e9',
			initialsFg: '#ffffff',
			logoChip: null,
		},
		dark: {
			bg: '#14161c',
			ink: '#ffffff',
			soft: '#c3c4c7',
			accent: '#7b90ff',
			box: '#1e1e1e',
			boxBorder: '#ffffff',
			plusBg: '#ffffff',
			plusFg: '#1e1e1e',
			dots: [ 123, 144, 255 ],
			shadow: [ 123, 144, 255 ],
			shadowAlpha: [ 0.3, 0.08 ],
			avatarBorder: '#ffffff',
			initialsBg: '#3858e9',
			initialsFg: '#ffffff',
			// Sponsor logos are usually dark: give them a light background.
			logoChip: '#ffffff',
		},
	};

	const SANS = '"WPBR Inter", Inter, "Helvetica Neue", Arial, sans-serif';
	const MONO = '"WPBR Plex Mono", "IBM Plex Mono", Menlo, Consolas, monospace';
	const WP_GLYPH = '';
	const SCALES = [ 1, 0.94, 0.88, 0.82, 0.76, 0.7, 0.64, 0.58, 0.52, 0.46 ];

	const font = ( weight, size, family ) => `${ weight } ${ Math.round( size * 10 ) / 10 }px ${ family }`;

	/* ------------------------------------------------------------------ */
	/* Loading                                                             */
	/* ------------------------------------------------------------------ */

	const imageCache = new Map();

	function loadImage( src ) {
		if ( ! src ) {
			return Promise.resolve( null );
		}
		if ( ! imageCache.has( src ) ) {
			imageCache.set(
				src,
				new Promise( ( resolve ) => {
					const img = new Image();
					img.onload = () => resolve( img );
					img.onerror = () => resolve( null );
					img.src = src;
				} )
			);
		}
		return imageCache.get( src );
	}

	function ready() {
		if ( ! document.fonts || ! document.fonts.load ) {
			return Promise.resolve();
		}
		return Promise.all( [
			document.fonts.load( font( 400, 40, SANS ), 'Aã' ),
			document.fonts.load( font( 600, 40, SANS ), 'Aã' ),
			document.fonts.load( font( 700, 40, SANS ), 'Aã' ),
			document.fonts.load( font( 400, 40, MONO ), 'Aã' ),
			document.fonts.load( font( 500, 40, MONO ), 'Aã' ),
			document.fonts.load( font( 700, 40, MONO ), 'Aã' ),
			document.fonts.load( '40px dashicons', WP_GLYPH ),
		] ).catch( () => {} );
	}

	/* ------------------------------------------------------------------ */
	/* Text helpers                                                        */
	/* ------------------------------------------------------------------ */

	function wrapText( ctx, text, maxW ) {
		const lines = [];
		String( text || '' )
			.split( /\n/ )
			.forEach( ( paragraph ) => {
				let line = '';
				paragraph
					.split( /\s+/ )
					.filter( Boolean )
					.forEach( ( word ) => {
						const test = line ? line + ' ' + word : word;
						if ( ! line || ctx.measureText( test ).width <= maxW ) {
							line = test;
						} else {
							lines.push( line );
							line = word;
						}
					} );
				if ( line ) {
					lines.push( line );
				}
			} );
		return lines;
	}

	function widest( ctx, lines ) {
		return lines.reduce( ( max, line ) => Math.max( max, ctx.measureText( line ).width ), 0 );
	}

	/**
	 * Wraps runs of differently styled text: [{ text, font, color }].
	 * Returns lines of pieces; each piece knows its own width.
	 */
	function wrapRich( ctx, runs, maxW ) {
		const lines = [];
		let current = [];
		let width = 0;

		const trim = () => {
			while ( current.length && current[ current.length - 1 ].text === ' ' ) {
				width -= current.pop().w;
			}
		};

		runs.forEach( ( run ) => {
			ctx.font = run.font;
			String( run.text || '' )
				.split( /(\s+)/ )
				.forEach( ( token ) => {
					if ( ! token ) {
						return;
					}
					const isSpace = /^\s+$/.test( token );
					const text = isSpace ? ' ' : token;
					const w = ctx.measureText( text ).width;
					if ( isSpace ) {
						if ( current.length ) {
							current.push( { text, font: run.font, color: run.color, w } );
							width += w;
						}
						return;
					}
					if ( current.length && width + w > maxW ) {
						trim();
						lines.push( current );
						current = [];
						width = 0;
					}
					current.push( { text, font: run.font, color: run.color, w } );
					width += w;
				} );
		} );
		trim();
		if ( current.length ) {
			lines.push( current );
		}
		return lines;
	}

	function drawRichLine( ctx, pieces, x, baseline ) {
		pieces.forEach( ( piece ) => {
			ctx.font = piece.font;
			ctx.fillStyle = piece.color;
			ctx.fillText( piece.text, x, baseline );
			x += piece.w;
		} );
	}

	function initials( name ) {
		const parts = String( name || '' ).trim().split( /\s+/ ).filter( Boolean );
		if ( ! parts.length ) {
			return '';
		}
		const first = parts[ 0 ][ 0 ];
		const last = parts.length > 1 ? parts[ parts.length - 1 ][ 0 ] : '';
		return ( first + last ).toUpperCase();
	}

	/* ------------------------------------------------------------------ */
	/* Shapes                                                              */
	/* ------------------------------------------------------------------ */

	function roundRect( ctx, x, y, w, h, r ) {
		ctx.beginPath();
		ctx.moveTo( x + r, y );
		ctx.arcTo( x + w, y, x + w, y + h, r );
		ctx.arcTo( x + w, y + h, x, y + h, r );
		ctx.arcTo( x, y + h, x, y, r );
		ctx.arcTo( x, y, x + w, y, r );
		ctx.closePath();
	}

	function drawBackground( ctx, W, H, u, theme ) {
		ctx.fillStyle = theme.bg;
		ctx.fillRect( 0, 0, W, H );

		// Dot grid that fades in towards the bottom-right corner.
		const step = 67.5 * u;
		const r = 3.6 * u;
		ctx.fillStyle = `rgb(${ theme.dots.join( ',' ) })`;
		for ( let y = H - 57 * u; y > 0; y -= step ) {
			for ( let x = W - 57 * u; x > 0; x -= step ) {
				const strength = ( ( x / W ) * 0.6 + ( y / H ) * 0.8 - 0.42 ) / 0.5;
				if ( strength <= 0 ) {
					continue;
				}
				ctx.globalAlpha = Math.min( 1, strength );
				ctx.beginPath();
				ctx.arc( x, y, r, 0, Math.PI * 2 );
				ctx.fill();
			}
		}
		ctx.globalAlpha = 1;
	}

	const shadowCache = new WeakMap();

	/**
	 * Turns any image into a soft blue "shadow": dark, opaque pixels become
	 * blue and light or transparent pixels disappear. Works for the bundled
	 * single-colour silhouettes and for photos uploaded as a watermark.
	 */
	function shadowOf( img, w, h, theme ) {
		const key = `${ w }x${ h }-${ theme.shadow.join() }-${ theme.shadowAlpha.join() }`;
		let byImage = shadowCache.get( img );
		if ( ! byImage ) {
			byImage = new Map();
			shadowCache.set( img, byImage );
		}
		if ( byImage.has( key ) ) {
			return byImage.get( key );
		}

		const off = document.createElement( 'canvas' );
		off.width = w;
		off.height = h;
		const octx = off.getContext( '2d', { willReadFrequently: true } );
		octx.drawImage( img, 0, 0, w, h );
		let pixels;
		try {
			pixels = octx.getImageData( 0, 0, w, h );
		} catch ( e ) {
			return null;
		}
		const data = pixels.data;
		const [ r, g, b ] = theme.shadow;
		const [ bottom, top ] = theme.shadowAlpha;
		for ( let y = 0; y < h; y++ ) {
			const fade = top + ( bottom - top ) * ( y / h );
			for ( let x = 0; x < w; x++ ) {
				const i = ( y * w + x ) * 4;
				const lum = ( 0.2126 * data[ i ] + 0.7152 * data[ i + 1 ] + 0.0722 * data[ i + 2 ] ) / 255;
				const alpha = ( data[ i + 3 ] / 255 ) * ( 1 - lum );
				data[ i ] = r;
				data[ i + 1 ] = g;
				data[ i + 2 ] = b;
				data[ i + 3 ] = Math.round( 255 * alpha * fade );
			}
		}
		octx.putImageData( pixels, 0, 0 );
		byImage.set( key, off );
		return off;
	}

	function drawLandmark( ctx, img, W, H, box, theme ) {
		if ( ! img || ! img.naturalWidth ) {
			return;
		}
		const ratio = img.naturalWidth / img.naturalHeight;
		let h = box.maxH;
		let w = h * ratio;
		if ( w > box.maxW ) {
			w = box.maxW;
			h = w / ratio;
		}
		const shadow = shadowOf( img, Math.max( 1, Math.round( w ) ), Math.max( 1, Math.round( h ) ), theme );
		if ( shadow ) {
			ctx.drawImage( shadow, W - box.right - shadow.width, H - shadow.height );
		}
	}

	function drawLogo( ctx, x, y, size, color ) {
		const hasDashicons = document.fonts && document.fonts.check( '20px dashicons', WP_GLYPH );
		ctx.fillStyle = color;
		if ( hasDashicons ) {
			ctx.font = '100px dashicons';
			ctx.textBaseline = 'alphabetic';
			const m = ctx.measureText( WP_GLYPH );
			const gw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
			const gh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
			const scale = size / Math.max( gw, gh, 1 );
			ctx.save();
			ctx.translate( x, y );
			ctx.scale( scale, scale );
			ctx.fillText( WP_GLYPH, m.actualBoundingBoxLeft, m.actualBoundingBoxAscent );
			ctx.restore();
			return;
		}
		// Fallback: ring with a serif W.
		ctx.lineWidth = size * 0.07;
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.arc( x + size / 2, y + size / 2, size / 2 - ctx.lineWidth / 2, 0, Math.PI * 2 );
		ctx.stroke();
		ctx.font = font( 700, size * 0.62, 'Georgia, serif' );
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText( 'W', x + size / 2, y + size / 2 + size * 0.03 );
		ctx.textAlign = 'left';
		ctx.textBaseline = 'alphabetic';
	}

	/*
	 * Icons drawn in a size×size box with the foreground colour already set
	 * as fillStyle/strokeStyle; `bg` is the colour behind the icon.
	 */
	const ICONS = {
		bookmark( ctx, x, y, s ) {
			const w = s * 0.78;
			const left = x + ( s - w ) / 2;
			ctx.beginPath();
			ctx.moveTo( left, y );
			ctx.lineTo( left + w, y );
			ctx.lineTo( left + w, y + s );
			ctx.lineTo( left + w / 2, y + s * 0.68 );
			ctx.lineTo( left, y + s );
			ctx.closePath();
			ctx.fill();
		},
		calendar( ctx, x, y, s, bg ) {
			const fg = ctx.fillStyle;
			roundRect( ctx, x, y + s * 0.04, s, s * 0.92, s * 0.13 );
			ctx.fill();
			ctx.fillStyle = bg;
			ctx.fillRect( x + s * 0.1, y + s * 0.32, s * 0.8, s * 0.54 );
			ctx.fillStyle = fg;
			const d = s * 0.12;
			[ 0.42, 0.64 ].forEach( ( row ) => {
				[ 0.22, 0.44, 0.66 ].forEach( ( col ) => ctx.fillRect( x + s * col, y + s * row, d, d ) );
			} );
		},
		clock( ctx, x, y, s ) {
			const c = s / 2;
			ctx.lineWidth = s * 0.11;
			ctx.lineCap = 'square';
			ctx.beginPath();
			ctx.arc( x + c, y + c, c - ctx.lineWidth / 2, 0, Math.PI * 2 );
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo( x + c, y + s * 0.24 );
			ctx.lineTo( x + c, y + c );
			ctx.lineTo( x + s * 0.7, y + c );
			ctx.stroke();
			ctx.lineCap = 'butt';
		},
		pin( ctx, x, y, s, bg ) {
			const fg = ctx.fillStyle;
			const r = s * 0.34;
			const cx = x + s / 2;
			const cy = y + r + s * 0.04;
			ctx.beginPath();
			ctx.arc( cx, cy, r, Math.PI * 0.82, Math.PI * 0.18 );
			ctx.lineTo( cx, y + s );
			ctx.closePath();
			ctx.fill();
			ctx.fillStyle = bg;
			ctx.beginPath();
			ctx.arc( cx, cy, r * 0.42, 0, Math.PI * 2 );
			ctx.fill();
			ctx.fillStyle = fg;
		},
		drag( ctx, x, y, s ) {
			const d = s * 0.13;
			[ 0.1, 0.45, 0.8 ].forEach( ( row ) => {
				ctx.fillRect( x + s * 0.3, y + s * row, d, d );
				ctx.fillRect( x + s * 0.6, y + s * row, d, d );
			} );
		},
		chevrons( ctx, x, y, s ) {
			ctx.lineWidth = s * 0.09;
			ctx.beginPath();
			ctx.moveTo( x + s * 0.12, y + s * 0.32 );
			ctx.lineTo( x + s * 0.5, y );
			ctx.lineTo( x + s * 0.88, y + s * 0.32 );
			ctx.moveTo( x + s * 0.12, y + s * 0.68 );
			ctx.lineTo( x + s * 0.5, y + s );
			ctx.lineTo( x + s * 0.88, y + s * 0.68 );
			ctx.stroke();
		},
		align( ctx, x, y, s ) {
			const t = s * 0.08;
			ctx.fillRect( x, y + s * 0.05, s, t );
			ctx.fillRect( x, y + s * 0.3, s, s * 0.38 );
			ctx.fillRect( x, y + s * 0.87, s, t );
		},
		heading( ctx, x, y, s ) {
			ctx.font = font( 600, s * 0.95, SANS );
			ctx.textBaseline = 'middle';
			ctx.fillText( 'H1', x - s * 0.08, y + s * 0.52 );
			ctx.textBaseline = 'alphabetic';
		},
		justify( ctx, x, y, s ) {
			const t = s * 0.08;
			ctx.fillRect( x, y + s * 0.05, s * 0.55, t );
			ctx.fillRect( x, y + s * 0.47, s, t );
			ctx.fillRect( x, y + s * 0.87, s * 0.55, t );
		},
	};

	/* ------------------------------------------------------------------ */
	/* Toolbar boxes                                                       */
	/* ------------------------------------------------------------------ */

	/**
	 * A box made of cells, like the block editor toolbar. Each cell has
	 * items: { icon, w } | { logo, w } | { text, font, w } | { gap }.
	 */
	function measureBox( cells, u ) {
		cells.forEach( ( cell ) => {
			cell.w = cell.pad * 2 + cell.items.reduce( ( sum, item ) => sum + ( item.w || item.gap ), 0 );
		} );
		const border = Math.max( 2, 3 * u );
		return cells.reduce( ( sum, cell ) => sum + cell.w, 0 ) + border * ( cells.length - 1 );
	}

	function drawBox( ctx, cells, x, y, h, u, theme ) {
		const border = Math.max( 2, 3 * u );
		const width = measureBox( cells, u );
		ctx.fillStyle = theme.box;
		ctx.strokeStyle = theme.boxBorder;
		ctx.lineWidth = border;
		roundRect( ctx, x, y, width, h, 6 * u );
		ctx.fill();
		ctx.stroke();

		let cx = x;
		cells.forEach( ( cell, index ) => {
			if ( index ) {
				ctx.fillStyle = theme.boxBorder;
				ctx.fillRect( cx, y, border, h );
				cx += border;
			}
			let ix = cx + cell.pad;
			cell.items.forEach( ( item ) => {
				ctx.fillStyle = theme.ink;
				ctx.strokeStyle = theme.ink;
				if ( item.logo ) {
					drawLogo( ctx, ix, y + ( h - item.w ) / 2, item.w, theme.accent );
				} else if ( item.icon ) {
					ICONS[ item.icon ]( ctx, ix, y + ( h - item.w ) / 2, item.w, theme.box );
				} else if ( item.text ) {
					ctx.font = item.font;
					ctx.textBaseline = 'middle';
					ctx.fillText( item.text, ix, y + h / 2 + h * 0.02 );
					ctx.textBaseline = 'alphabetic';
				}
				ix += item.w || item.gap;
			} );
			cx += cell.w;
		} );
		return width;
	}

	/** Left box: WordPress logo and the label ("Meetup Presencial"). */
	function headerCells( ctx, d, h, maxW ) {
		const logo = h * 0.48;
		const pad = h * 0.27;
		let size = h * 0.39;
		ctx.font = font( 600, size, SANS );
		const fixed = pad * 2 + logo + h * 0.18;
		const textW = ctx.measureText( d.header ).width;
		if ( maxW && fixed + textW > maxW ) {
			size = Math.max( h * 0.22, ( size * ( maxW - fixed ) ) / textW );
			ctx.font = font( 600, size, SANS );
		}
		const items = [ { logo: true, w: logo } ];
		if ( d.header ) {
			items.push( { gap: h * 0.18 }, { text: d.header, font: font( 600, size, SANS ), w: ctx.measureText( d.header ).width } );
		}
		return [ { pad, items } ];
	}

	/** Right box: date and time with icons, or editor icons when empty. */
	function toolbarCells( ctx, d, h ) {
		const textFont = font( 600, h * 0.39, SANS );
		const icon = h * 0.3;
		const pad = h * 0.3;
		const cells = [];
		ctx.font = textFont;

		if ( d.dateText || d.timeText ) {
			[ [ 'calendar', d.dateText ], [ 'clock', d.timeText ] ].forEach( ( [ name, text ] ) => {
				if ( text ) {
					cells.push( { pad, items: [ { icon: name, w: icon }, { gap: h * 0.16 }, { text, font: textFont, w: ctx.measureText( text ).width } ] } );
				}
			} );
			return cells;
		}

		const icons = ( names ) =>
			names.reduce( ( items, name, i ) => items.concat( i ? [ { gap: h * 0.25 } ] : [], [ { icon: name, w: icon } ] ), [] );
		cells.push( { pad, items: icons( [ 'bookmark', 'drag', 'chevrons' ] ) } );
		cells.push( { pad, items: icons( [ 'align', 'heading', 'justify' ] ) } );
		return cells;
	}

	/* ------------------------------------------------------------------ */
	/* Title, avatars, sponsors                                            */
	/* ------------------------------------------------------------------ */

	/**
	 * Title inside the blue "selected block" frame with the inserter button.
	 * Returns the frame height; draws only when `draw` is true.
	 */
	function titleBlock( ctx, d, x, y, w, size, maxLines, u, theme, draw ) {
		const weight = String( d.titleWeight ) === '700' ? 700 : 400;
		const padX = 18 * u;
		const plus = 90 * u;
		const maxW = w - padX * 2 - plus * 1.6;
		let lines;
		do {
			ctx.font = font( weight, size, SANS );
			lines = wrapText( ctx, d.title || ' ', maxW );
			if ( ( lines.length <= maxLines && widest( ctx, lines ) <= maxW ) || size < 30 * u ) {
				break;
			}
			size *= 0.92;
		} while ( true );

		// Avoid a lonely short word ("Parte / 2") on the last line.
		const last = lines.length - 1;
		if ( last > 0 && lines[ last ].length <= 3 && lines[ last - 1 ].includes( ' ' ) ) {
			const words = lines[ last - 1 ].split( ' ' );
			const moved = words.pop() + ' ' + lines[ last ];
			if ( ctx.measureText( moved ).width <= maxW ) {
				lines[ last - 1 ] = words.join( ' ' );
				lines[ last ] = moved;
			}
		}

		const lh = size * 1.27;
		const padY = 16 * u;
		const h = lines.length * lh + padY * 2;

		if ( draw ) {
			roundRect( ctx, x, y, w, h, 18 * u );
			ctx.fillStyle = theme.box;
			ctx.fill();
			ctx.strokeStyle = theme.accent;
			ctx.lineWidth = 4 * u;
			ctx.stroke();

			ctx.fillStyle = theme.ink;
			ctx.font = font( weight, size, SANS );
			lines.forEach( ( line, i ) => {
				ctx.fillText( line, x + padX, y + padY + i * lh + lh / 2 + size * 0.36 );
			} );

			const px = x + w - plus;
			const py = y + h - plus + 2 * u;
			ctx.fillStyle = theme.plusBg;
			roundRect( ctx, px, py, plus, plus, 3 * u );
			ctx.fill();
			ctx.fillStyle = theme.plusFg;
			const arm = plus * 0.46;
			const t = Math.max( 2, plus * 0.055 );
			ctx.fillRect( px + ( plus - arm ) / 2, py + ( plus - t ) / 2, arm, t );
			ctx.fillRect( px + ( plus - t ) / 2, py + ( plus - arm ) / 2, t, arm );
		}
		return h;
	}

	function drawAvatar( ctx, img, name, cx, cy, size, theme ) {
		const r = size / 2;
		ctx.save();
		ctx.beginPath();
		ctx.arc( cx, cy, r, 0, Math.PI * 2 );
		ctx.closePath();
		if ( img ) {
			ctx.clip();
			const scale = Math.max( size / img.naturalWidth, size / img.naturalHeight );
			const w = img.naturalWidth * scale;
			const h = img.naturalHeight * scale;
			ctx.drawImage( img, cx - w / 2, cy - h / 2, w, h );
		} else {
			ctx.fillStyle = theme.initialsBg;
			ctx.fill();
			ctx.fillStyle = theme.initialsFg;
			ctx.font = font( 600, size * 0.34, SANS );
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText( initials( name ), cx, cy + size * 0.02 );
			ctx.textAlign = 'left';
			ctx.textBaseline = 'alphabetic';
		}
		ctx.restore();
		ctx.strokeStyle = theme.avatarBorder;
		ctx.lineWidth = Math.max( 2, size * 0.022 );
		ctx.beginPath();
		ctx.arc( cx, cy, r, 0, Math.PI * 2 );
		ctx.stroke();
	}

	/**
	 * Lays out sponsor logos in a row. Logos share one height; names
	 * without a logo are drawn as text. On dark artwork each logo sits on a
	 * light chip so dark logos stay visible.
	 */
	function sponsorsRow( ctx, sponsors, x, y, h, maxW, u, theme ) {
		const chip = theme.logoChip ? h * 0.18 : 0;
		const gap = h * 0.6;
		const inner = h - chip * 2;
		const items = sponsors.map( ( s ) => {
			if ( s.logo ) {
				const ratio = s.logo.naturalWidth / s.logo.naturalHeight;
				const w = Math.min( inner * ratio, inner * 4.5 );
				return { logo: s.logo, w: w + chip * 2, lw: w, lh: w / ratio };
			}
			ctx.font = font( 700, h * 0.42, SANS );
			return { name: s.name, w: ctx.measureText( s.name ).width };
		} );
		const total = items.reduce( ( sum, item ) => sum + item.w, 0 ) + gap * Math.max( 0, items.length - 1 );
		const scale = total > maxW ? maxW / total : 1;

		let cx = x;
		items.forEach( ( item ) => {
			const w = item.w * scale;
			if ( item.logo ) {
				if ( chip ) {
					ctx.fillStyle = theme.logoChip;
					roundRect( ctx, cx, y + ( h - h * scale ) / 2, w, h * scale, 8 * u );
					ctx.fill();
				}
				const lw = item.lw * scale;
				const lh = item.lh * scale;
				ctx.drawImage( item.logo, cx + ( w - lw ) / 2, y + ( h - lh ) / 2, lw, lh );
			} else {
				ctx.fillStyle = theme.ink;
				ctx.font = font( 700, h * 0.42 * scale, SANS );
				ctx.textBaseline = 'middle';
				ctx.fillText( item.name, cx, y + h / 2 );
				ctx.textBaseline = 'alphabetic';
			}
			cx += w + gap * scale;
		} );
	}

	function talkRuns( talk, size, compact, theme ) {
		const runs = [];
		if ( talk.title ) {
			runs.push( { text: talk.title, font: font( 500, size, MONO ), color: theme.ink } );
		}
		if ( talk.speaker && ! compact ) {
			runs.push( { text: ( talk.title ? ' - ' : '' ) + talk.speaker, font: font( 400, size, MONO ), color: theme.soft } );
		}
		return runs;
	}

	/**
	 * Description, venue (with a pin) and highlight, as measured blocks.
	 */
	function extraBlocks( ctx, d, size, lh, width, theme, first ) {
		const blocks = [];
		const add = ( text, weight, gap, icon ) => {
			if ( ! text ) {
				return;
			}
			const indent = icon ? size * 1.15 : 0;
			const runs = [ { text, font: font( weight, size, MONO ), color: theme.ink } ];
			blocks.push( {
				lines: wrapRich( ctx, runs, width - indent ),
				lh,
				indent,
				icon,
				gapBefore: blocks.length || ! first ? gap : 0,
			} );
		};
		add( d.description, 400, 0.6 * lh );
		add( d.venue, 400, 0.6 * lh, 'pin' );
		add( d.highlight, 700, 1.1 * lh );
		return blocks;
	}

	function drawTextBlock( ctx, block, x, y, size, theme ) {
		if ( block.icon ) {
			ctx.fillStyle = theme.ink;
			const s = size * 0.8;
			ICONS[ block.icon ]( ctx, x, y + ( block.lh - s ) / 2, s, theme.bg );
		}
		block.lines.forEach( ( line, i ) => drawRichLine( ctx, line, x + block.indent, y + i * block.lh + block.lh * 0.74 ) );
	}

	/* ------------------------------------------------------------------ */
	/* Layouts                                                             */
	/* ------------------------------------------------------------------ */

	/**
	 * Landscape: mirrors the 1920×1080 reference. Returns { ops, overflow }.
	 */
	function layoutLandscape( ctx, d, W, H, f, theme ) {
		const u = Math.min( W / 1920, H / 1080 );
		const M = 120 * u;
		const ops = [];
		const top = 80 * u;
		const rowH = 144 * u;

		// Header: logo box on the left, date/time box on the right.
		const right = toolbarCells( ctx, d, rowH );
		const rightW = measureBox( right, u );
		const left = headerCells( ctx, d, rowH, W - 2 * M - rightW - 40 * u );
		ops.push( () => {
			drawBox( ctx, left, M, top, rowH, u, theme );
			drawBox( ctx, right, W - M - rightW, top, rowH, u, theme );
		} );

		// Title.
		const titleY = top + rowH + 64 * u;
		const titleW = W - 2 * M;
		const titleH = titleBlock( ctx, d, M, titleY, titleW, 110 * u * f, 3, u, theme, false );
		ops.push( () => titleBlock( ctx, d, M, titleY, titleW, 110 * u * f, 3, u, theme, true ) );

		// Sponsors.
		const sponsorH = 80 * u;
		const sponsorY = H - 70 * u - sponsorH;
		const limit = d.sponsors.length ? sponsorY - 36 * u : H - 64 * u;
		if ( d.sponsors.length ) {
			ops.push( () => sponsorsRow( ctx, d.sponsors, M, sponsorY, sponsorH, W * 0.62, u, theme ) );
		}

		// Talks and details on the left; photos on the right.
		const people = d.talks.filter( ( t ) => t.photo || t.speaker );
		const gap = 30 * u;
		let avatar = 0;
		if ( people.length ) {
			avatar = Math.min( 180 * u * f, ( titleW * 0.4 - gap * ( people.length - 1 ) ) / people.length );
		}
		const avatarsW = people.length ? people.length * avatar + ( people.length - 1 ) * gap : 0;
		const textW = titleW - ( avatarsW ? avatarsW + 50 * u : 0 );

		const size = 50 * u * f;
		const lh = size * 1.24;
		const blocks = [];
		d.talks.forEach( ( talk ) => {
			const runs = talkRuns( talk, size, false, theme );
			if ( runs.length ) {
				blocks.push( { lines: wrapRich( ctx, runs, textW ), lh, indent: 0 } );
			}
		} );
		blocks.push( ...extraBlocks( ctx, d, size, lh, textW, theme, ! blocks.length ) );

		const textTop = titleY + titleH + 76 * u * f;
		let cursor = textTop;
		blocks.forEach( ( block ) => {
			cursor += block.gapBefore || 0;
			block.y = cursor;
			cursor += block.lines.length * block.lh;
		} );
		const avatarTop = textTop - 6 * u;
		const contentBottom = Math.max( cursor, people.length ? avatarTop + avatar : 0 );

		ops.push( () => {
			blocks.forEach( ( block ) => drawTextBlock( ctx, block, M, block.y, size, theme ) );
			people.forEach( ( person, i ) => {
				const cx = W - M - avatarsW + i * ( avatar + gap ) + avatar / 2 + 25 * u;
				drawAvatar( ctx, person.photo, person.speaker, cx, avatarTop + avatar / 2, avatar, theme );
			} );
		} );

		return {
			ops,
			overflow: contentBottom > limit,
			landmark: { maxW: W * 0.42, maxH: H * 0.4, right: 30 * u },
		};
	}

	/**
	 * Square, portrait and stories: everything stacked in one column.
	 */
	function layoutStacked( ctx, d, W, H, f, format, theme ) {
		const u = W / 1080;
		const M = 72 * u;
		const ops = [];
		const safeTop = ( format.safe_top || 0 ) * u;
		const safeBottom = ( format.safe_bottom || 0 ) * u;
		const contentW = W - 2 * M;
		// Tall formats (stories) have room for larger text.
		f *= H / W > 1.6 ? 1.15 : 1;

		const top = Math.max( 64 * u, safeTop );
		const boxH = 104 * u;
		const items = [];

		// Logo box, then date/time box.
		const left = headerCells( ctx, d, boxH, contentW );
		items.push( { h: boxH, draw: ( y ) => drawBox( ctx, left, M, y, boxH, u, theme ) } );
		const right = toolbarCells( ctx, d, boxH );
		items.push( { gap: 24 * u, h: boxH, draw: ( y ) => drawBox( ctx, right, M, y, boxH, u, theme ) } );

		// Sponsors.
		const sponsorH = 72 * u;
		const sponsorY = H - Math.max( 64 * u, safeBottom ) - sponsorH;
		const limit = d.sponsors.length ? sponsorY - 40 * u : H - Math.max( 64 * u, safeBottom );
		if ( d.sponsors.length ) {
			ops.push( () => sponsorsRow( ctx, d.sponsors, M, sponsorY, sponsorH, contentW, u, theme ) );
		}

		const titleSize = 84 * u * f;
		const titleH = titleBlock( ctx, d, M, 0, contentW, titleSize, 4, u, theme, false );
		items.push( { gap: 40 * u, h: titleH, draw: ( y ) => titleBlock( ctx, d, M, y, contentW, titleSize, 4, u, theme, true ) } );

		const size = 34 * u * f;
		const lh = size * 1.3;
		const avatar = 120 * u * f;
		let first = true;
		d.talks.forEach( ( talk ) => {
			const hasPerson = talk.photo || talk.speaker;
			const textX = hasPerson ? M + avatar + 28 * u : M;
			const textW = W - M - textX;
			const lines = wrapRich( ctx, talkRuns( talk, size, true, theme ), textW );
			const nameLines = talk.speaker ? wrapRich( ctx, [ { text: talk.speaker, font: font( 400, size, MONO ), color: theme.soft } ], textW ) : [];
			const all = lines.concat( nameLines );
			if ( ! all.length ) {
				return;
			}
			const textH = all.length * lh;
			const h = hasPerson ? Math.max( avatar, textH ) : textH;
			items.push( {
				gap: first ? 52 * u * f : 28 * u * f,
				h,
				draw: ( y ) => {
					if ( hasPerson ) {
						drawAvatar( ctx, talk.photo, talk.speaker, M + avatar / 2, y + h / 2, avatar, theme );
					}
					const ty = y + ( h - textH ) / 2;
					all.forEach( ( line, i ) => drawRichLine( ctx, line, textX, ty + i * lh + lh * 0.74 ) );
				},
			} );
			first = false;
		} );

		extraBlocks( ctx, d, size, lh, contentW, theme, false ).forEach( ( block, i ) => {
			items.push( {
				gap: i === 0 ? 44 * u * f : block.gapBefore,
				h: block.lines.length * lh,
				draw: ( y ) => drawTextBlock( ctx, block, M, y, size, theme ),
			} );
		} );

		const total = items.reduce( ( sum, item ) => sum + ( item.gap || 0 ) + item.h, 0 );
		const free = limit - top - total;
		let y = top + ( free > 0 ? free * 0.4 : 0 );
		ops.push( () => {
			items.forEach( ( item ) => {
				y += item.gap || 0;
				item.draw( y );
				y += item.h;
			} );
		} );

		return {
			ops,
			overflow: free < 0,
			landmark: { maxW: W * 0.78, maxH: H * 0.3, right: 0 },
		};
	}

	/* ------------------------------------------------------------------ */
	/* Public API                                                          */
	/* ------------------------------------------------------------------ */

	/**
	 * Renders `data` onto `canvas` at the format's full resolution.
	 *
	 * data: { theme, header, dateText, timeText, title, titleWeight,
	 *         description, venue, highlight,
	 *         talks: [{ title, speaker, photo: Image|null }],
	 *         sponsors: [{ name, logo: Image|null }], landmark: Image|null }
	 */
	function render( canvas, data, format ) {
		const W = format.width;
		const H = format.height;
		canvas.width = W;
		canvas.height = H;
		const ctx = canvas.getContext( '2d' );
		const theme = THEMES[ data.theme ] || THEMES.light;
		const landscape = W / H >= 1.5;
		const u = landscape ? Math.min( W / 1920, H / 1080 ) : W / 1080;

		let layout;
		for ( const f of SCALES ) {
			layout = landscape ? layoutLandscape( ctx, data, W, H, f, theme ) : layoutStacked( ctx, data, W, H, f, format, theme );
			if ( ! layout.overflow ) {
				break;
			}
		}

		ctx.clearRect( 0, 0, W, H );
		drawBackground( ctx, W, H, u, theme );
		drawLandmark( ctx, data.landmark, W, H, layout.landmark, theme );
		layout.ops.forEach( ( op ) => op() );

		return { overflow: layout.overflow };
	}

	window.WPBRArtesRenderer = { ready, loadImage, render };
} )();
