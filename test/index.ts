import {expect} from 'chai';
import {readFileSync} from 'fs';
import 'mocha';
import {resolve} from 'path';
import postcss from 'postcss';
import importPart, {
	PluginOptions,
} from '../src/index';

const parsers = {
	'.wrongcss': require( 'postcss-safe-parser' ),
	'.scss': require( 'postcss-scss' ),
};

describe(
	'Import part',
	() =>
	{
		it(
			'should inject on top level',
			() => check( 'simple' ),
		);
		
		it(
			'should inject on nested level',
			() => check( 'nested' ),
		);
		
		it(
			'should import from web_modules',
			() => check( 'modules' ),
		);
		
		it(
			'should allow custom resolve function',
			() => check(
				'custom-resolve',
				{
					resolve: ( path ) => (
						/^~\//.test( path )
						? resolve( __dirname, path.substr( 2 ) )
						: path
					),
				},
			),
		);
		
		it(
			'should import safe-parser file',
			() => check(
				'parser-safe',
				{
					parsers,
				},
			),
		);
		
		it(
			'should import scss file',
			() => check(
				'parser-scss',
				{
					parsers,
				},
			),
		);
	},
);

/**
 * Check PostCSS result with specific options.
 * 
 * @param options Plugin options.
 * @param input Input CSS.
 * @param output Expected output CSS.
 */
function check(
	name: string,
	options: Partial<PluginOptions> = {},
): Promise<void>
{
	const sourceName = resolve( __dirname, `fixtures/${name}.pcss` );
	const expectedName = resolve( __dirname, `fixtures/${name}.expected.pcss` );
	
	return postcss( [importPart( options )] )
		.process(
			readFileSync( sourceName, 'utf8' ),
			{from: sourceName},
		)
		.then(
			( result ) =>
			{
				expect(
					result.css,
				).to.equal(
					readFileSync( expectedName, 'utf8' ),
				);
			},
		);
}
