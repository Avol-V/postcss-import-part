import Fs from 'fs';
import {extname, resolve} from 'path';
import postcss from 'postcss';
import {promisify} from 'util';
import {PluginOptions} from './index';

const readFile = promisify(Fs.readFile);
const stat = promisify(Fs.stat);

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
async function readStylesFile(
	path: string,
	postcssResult: postcss.Result | undefined,
	options: PluginOptions,
): Promise<postcss.Root>
{
	const absolutePath = resolve( path );
	
	const fileStats = await stat( absolutePath );
	const item = cache.get( absolutePath );
	
	if (
		item
		&& ( item.mtime.getTime() === fileStats.mtime.getTime() )
	)
	{
		return Promise.resolve( item.content );
	}
	
	const fileContents = await readFile( absolutePath, 'utf8' );
	
	const extension = extname( path );
	const parser = options.parsers[extension] || null;
	
	const result = postcss( options.plugins ).process(
		fileContents,
		{
			from: absolutePath,
			parser,
		},
	);
	
	if ( !result.root )
	{
		throw new Error( `Empty import root in "${absolutePath}".` );
	}
	
	cache.set(
		absolutePath,
		{
			mtime: fileStats.mtime,
			content: result.root,
		},
	);
	
	if ( postcssResult && Array.isArray( postcssResult.messages ) )
	{
		postcssResult.messages = postcssResult.messages.concat(
			result.messages,
		);
	}
	
	return result.root;
}

/**
 * Module.
 */
export {
	readStylesFile as default,
};
