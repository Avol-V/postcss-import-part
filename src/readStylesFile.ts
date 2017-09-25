import {extname, resolve} from 'path';
import * as postcss from 'postcss';
import {readFile, stat, Stats} from 'ts-fs';
import {PluginOptions} from './index';

/**
 * Item in files cache.
 */
interface CacheItem
{
	mtime: Date;
	content: postcss.Root;
}

/**
 * Cached file contents.
 */
const cache = new Map<string, CacheItem>();

/**
 * Read content from styles file.
 * 
 * @param path Path to styles file.
 */
function readStylesFile(
	path: string, postcssResult: postcss.Result, options: PluginOptions,
): Promise<postcss.Root>
{
	const absolutePath = resolve( path );
	
	const onStat = ( stats: Stats ): Promise<postcss.Root> =>
	{
		const item = cache.get( absolutePath );
		
		if (
			item
			&& ( item.mtime.getTime() === stats.mtime.getTime() )
		)
		{
			return Promise.resolve( item.content );
		}
		
		return readFile( absolutePath, 'utf8' )
			.then( ( value ) => onFile( stats, value ) );
	};
	
	const onFile = ( {mtime}: Stats, value: string ): Promise<postcss.Root> =>
	{
		const extension = extname( path );
		const parser = options.parsers[extension] || null;
		
		return postcss( options.plugins ).process(
			value,
			{
				from: absolutePath,
				parser,
			},
		)
			.then(
				( result: postcss.Result ): postcss.Root =>
				{
					if ( !result.root )
					{
						throw new Error( `Empty import root in "${absolutePath}".` );
					}
					
					cache.set(
						absolutePath,
						{
							mtime,
							content: result.root,
						},
					);
					
					postcssResult.messages = postcssResult.messages.concat(
						result.messages,
					);
					
					return result.root;
				},
			);
	};
	
	const onError = ( error: Error ) =>
	{
		cache.delete( absolutePath );
		throw error;
	};
	
	return stat( absolutePath )
		.then( onStat )
		.catch( onError );
}

/**
 * Module.
 */
export {
	readStylesFile as default,
};
