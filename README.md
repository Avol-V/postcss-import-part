[![NPM][npm]][npm-url]
[![Dependencies][deps]][deps-url]
[![DevDependencies][deps-dev]][deps-dev-url]
[![Tests][build]][build-url]

# postcss-import-part

[PostCSS] plugin to import external file content at any place (like partial import).

To import adjacent file, path should be relative (like `./_part.css`). Can import from `node_modules` (or `web_modules`) as well.

*Currently recursive imports are not allowed.*

You can also specify Parsers for imported files by extension.

## Syntax

```
@import-part <string>;

where
<string> is path to file or module name.
```

## Example

```css
div
{
	@import-part "./imports/imported.pcss";
}
```

Output:

```css
div
	.imported
	{
		color: red;
	}
}
```

You can find more examples in [tests](test/).

## Install

```
npm install --save-dev postcss-import-part
```

## Usage

It’s asynchronous plugin, so use should youse promises or async/await.

Source file path is required to resolve relative paths. If this path is not
specified, `root` option is used (`process.cwd()` by default).

In this example used custom resolver to process paths, started from `~/`, as
relative to `__dirname`.

```js
const postcss = require( 'postcss' );
const importJson = require( 'postcss-import-json' ).default;

const css = '@import-part "~/fixtures/imports/imported.pcss";';
const options = {
	resolve: ( path ) => (
		/^~\//.test( path )
		? resolve( __dirname, path.substr( 2 ) )
		: path
	),
};

postcss( [globalVars( options )] )
	.process(
		css,
		{from: '/tmp/test.css'},
	)
	.then(
		( result ) =>
		{
			console.log( result.css ); // => '.imported\n{\n\tcolor: red;\n}'
		},
	);
```

## Options

### `root`

Type: `string`
Default: `process.cwd()`

The root directory where to resolve path. Used to resolve relative paths when
path of source file is not specified.

### `moduleDirectory`

Type: `string[]`
Default: `['web_modules', 'node_modules']`

Directory (or directories) in which to recursively look for modules.

### `paths`

Type: `string[]`
Default: `[]`

Paths array to use if nothing is found on the normal node_modules recursive walk.

### `plugins`

Type: `postcss.AcceptedPlugin[]`
Default: `[]`

PostCSS plugins to be applied on each imported files.

### `parsers`

Type: `{[key: string]: Parse | Syntax}`
Default: `{}`

PostCSS parsers by file extension. Object key should be an extension as `path.extname` result, and value should be a parser plugin.

```js
{
	'.sss': require( 'sugarss' ),
}
```

### `resolve`

Type: `( uri: string, basedir: string, options: PluginOptions ): string | Promise<string>`
Default: `undefined`

Custom path resolver. Relative path can be returned to continue processing with
default resolver.

Function arguments:

* `uri` — URI from import rule (original path).
* `basedir` — Base directory for current import.
* `options` — Plugin options.

## Change Log

[View changelog](CHANGELOG.md).

## License

[MIT](LICENSE).

[npm]: https://img.shields.io/npm/v/postcss-import-part.svg
[npm-url]: https://npmjs.com/package/postcss-import-part

[deps]: https://img.shields.io/david/Avol-V/postcss-import-part.svg
[deps-url]: https://david-dm.org/Avol-V/postcss-import-part

[deps-dev]: https://img.shields.io/david/dev/Avol-V/postcss-import-part.svg
[deps-dev-url]: https://david-dm.org/Avol-V/postcss-import-part?type=dev

[build]: https://img.shields.io/travis/Avol-V/postcss-import-part.svg
[build-url]: https://travis-ci.org/Avol-V/postcss-import-part

[PostCSS]: https://github.com/postcss/postcss
