import {resolve} from 'path';
import {
	AcceptedPlugin, AtRule, Parse, plugin, Plugin, Result, Root, Syntax,
	Transformer,
} from 'postcss';
import getCssBaseDir from './getCssBaseDir';
import parseParams, {ParsedParams} from './parseParams';
import readStylesFile from './readStylesFile';
import resolveUri from './resolveUri';

/**
 * Name of this plugin.
 */
const PLUGIN_NAME = 'postcss-import-part';
/**
 * Name of the plugin At-Rule.
 */
const RULE_NAME = 'import-part';

/**
 * Default plugin options.
 */
const DEFAULT_OPTIONS: Readonly<PluginOptions> = {
	root: process.cwd(),
	moduleDirectory: [
		'web_modules',
		'node_modules',
	],
	paths: [],
	plugins: [],
	parsers: {},
};

/**
 * Plugin options.
 */
export interface PluginOptions
{
	/**
	 * The root directory where to resolve path.
	 */
	root: string;
	/**
	 * Directory (or directories) in which to recursively look for modules.
	 */
	moduleDirectory: string | string[];
	/**
	 * Paths array to use if nothing is found on the normal node_modules
	 * recursive walk.
	 */
	paths: string | string[];
	/**
	 * PostCSS plugins to be applied on each imported files.
	 */
	plugins: AcceptedPlugin[];
	/**
	 * PostCSS parsers by file extension.
	 */
	parsers: {[key: string]: Parse | Syntax};
	/**
	 * Custom path resolver.
	 * 
	 * @param uri URI from import rule.
	 * @param basedir Base directory for current import.
	 * @param options Import options.
	 */
	resolve?( uri: string, basedir: string, options: PluginOptions ):
		string | Promise<string>;
}

/**
 * PostCSS plugin to import variables from JSON file.
 * 
 * @param userOptions Plugin options.
 */
function main( userOptions: Partial<PluginOptions> ): Transformer
{
	const options: PluginOptions = {...DEFAULT_OPTIONS, ...userOptions};
	
	options.root = resolve( options.root );
	
	const resultPromises: Array<Promise<void>> = [];
	
	const onAtRule = ( rule: AtRule, result: Result ): void =>
	{
		let params: ParsedParams;
		
		try
		{
			params = parseParams( rule.params );
		}
		catch ( error )
		{
			throw rule.error( error.message, {plugin: PLUGIN_NAME} );
		}
		
		const onError = ( error: Error ) =>
		{
			throw rule.error( error.message, {plugin: PLUGIN_NAME} );
		};
		
		const onContent = ( content: Root ): void =>
		{
			rule.parent.insertAfter( rule, content.clone() );
			rule.remove();
		};
		
		const promise = resolveUri(
			params.uri,
			getCssBaseDir( rule ) || options.root,
			options,
		)
			.then(
				( path ) => readStylesFile(
					path,
					result,
					options,
				),
			)
			.then( onContent )
			.catch( onError );
		
		resultPromises.push( promise );
	};
	
	return ( root: Root, result: Result ): Promise<void[]> =>
	{
		root.walkAtRules(
			RULE_NAME,
			( rule: AtRule ) => onAtRule( rule, result ),
		);
		
		return Promise.all( resultPromises );
	};
}

/**
 * PostCSS plugin.
 */
const postImportJsonPlugin: Plugin<Partial<PluginOptions>> = plugin(
	PLUGIN_NAME,
	main,
);

/**
 * Module.
 */
export {
	postImportJsonPlugin as default,
};
