import {isAbsolute} from 'path';
import * as nodeResolve from 'resolve';
import {PluginOptions} from './index';

/**
 * Path resolver.
 * 
 * @param uri URI from import rule.
 * @param basedir Base directory for current import.
 * @param options Import options.
 */
function resolveUri(
	uri: string, basedir: string, options: PluginOptions,
): Promise<string>
{
	const onCustomResolve = ( path: string ): string | Promise<string> =>
	{
		if ( isAbsolute( path ) )
		{
			return path;
		}
		
		const resolveOptions: nodeResolve.AsyncOpts = {
			basedir,
			moduleDirectory: options.moduleDirectory,
			paths: options.paths,
			extensions: ['.css'],
			packageFilter,
		};
		
		return new Promise<string>(
			( resolve, reject ) =>
			{
				nodeResolve(
					path,
					resolveOptions,
					( error, resolved ) => (
						error
						? reject( error )
						: resolve( resolved )
					),
				);
			},
		);
	};
	
	return Promise.resolve(
		options.resolve
		? options.resolve( uri, basedir, options )
		: uri,
	)
		.then( onCustomResolve );
}

/**
 * Process package data to update main file value.
 * 
 * @param data Package data.
 */
function packageFilter( data: any ): any
{
	if ( data.style )
	{
		data.main = data.style;
	}
	else if (
		!data.main
		|| !/\.css$/.test( data.main )
	)
	{
		data.main = 'index.css';
	}
	
	return data;
}

/**
 * Module.
 */
export {
	resolveUri as default,
};
