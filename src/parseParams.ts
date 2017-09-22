/**
 * Pattern for parsing rule parameters.
 */
const PARAMS_PATTERN = /^\s*('[^\\']*(?:\\.[^\\']*)*'|"[^\\"]*(?:\\.[^\\"]*)*")\s*$/;

/**
 * Rule parameters.
 */
export interface ParsedParams
{
	/** Path to imported file. */
	uri: string;
}

/**
 * Parse rule parameters.
 * 
 * @param params Parameters string.
 */
function parseParams( params: string ): ParsedParams
{
	const matches = PARAMS_PATTERN.exec( params );
	
	if ( !matches )
	{
		throw new SyntaxError( `Incorrect parameters "${params}".` );
	}
	
	const uri = matches[1].slice( 1, -1 ).replace( /\\(['"])/, '$1' );
	
	if ( !uri )
	{
		throw new URIError( 'Empty import path.' );
	}
	
	return {
		uri,
	};
}

/**
 * Module.
 */
export {
	parseParams as default,
};
