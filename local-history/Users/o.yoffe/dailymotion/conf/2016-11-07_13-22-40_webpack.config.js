/* jshint node: true */

var webpack = require('webpack'),
    path = require('path'),
    fs = require('fs'),
    ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');

var projectPath = path.join(__dirname, '..'),
    baseConfPath = path.join(projectPath, '/cache/webpack_base_conf.json');

if (!fs.existsSync(baseConfPath))
{
    console.log(
        '\033[31m',
        'Base configuration file "',
        baseConfPath,
        '" not found. Please run "make compile" and try again.',
        '\033[0m'
    );
    process.abort();
}

console.log('------------baseConf.outputPath-------------------',baseConf.outputPath)

var providePlugin = {};

if (process.argv.indexOf('-p')) {
    providePlugin.Debug = 'react-component-debug';
}

var baseConf = JSON.parse(fs.readFileSync(baseConfPath)),
    outputPath = path.join(projectPath, baseConf.outputPath),
    entryList = require(path.join(projectPath, 'conf/webpack-entrypoints.js')),
    output =
    {
        path: outputPath,
        publicPath: baseConf.publicPath,
        filename: '[name].[chunkhash].js',
        chunkFilename: '[id].[chunkhash].js'
    },
    configuration =
    {
        entry: entryList,
        output: output,
        recordsPath: path.join(projectPath, 'inc/dyn/webpack.records.json'), // allow to keep same chunk ordering in bundles across builds
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': "'" + process.env.NODE_ENV + "'"
                }
            }),
            // We could also make a common pack for home + player page + videos
            // AND have another common for all other pages
            // 75% (or another %) of the count of entry points
            new webpack.optimize.CommonsChunkPlugin(
                baseConf.commonBundleName,
                Math.floor(75*Object.keys(entryList).length/100)
            ),
            new ChunkManifestPlugin(
            {
                // filename is relative to output.path
                filename: path.relative(outputPath, path.join(projectPath, baseConf.manifestPath)),
                manifestVariable: baseConf.manifestVariable
            }),
            function()
            {
                this.plugin("done", function(stats)
                {
                    var JSONStats = stats.toJson();

                    var bundlesBuilt = JSONStats.assets.map(function(asset) { return asset.name; }),
                        currentBundlesList = fs.readdirSync(outputPath),
                        outdatedBundles = [];

                    currentBundlesList.forEach(function(bundleName)
                    {
                        if (bundlesBuilt.indexOf(bundleName) < 0)
                        {
                            var outdatedBundle = path.join(outputPath, bundleName);
                            fs.unlinkSync(outdatedBundle);
                            outdatedBundles.push(outdatedBundle);
                        }
                    });

                    if (outdatedBundles.length)
                    {
                        console.log(
                            '\n\033[33m',
                            'Found and removed', outdatedBundles.length, "outdated bundles:\n",
                            outdatedBundles.join("\n"),
                            '\033[0m'
                        );
                    }

                    fs.writeFileSync(
                        path.join(projectPath, baseConf.statsPath),
                        "<?php\nreturn " +
                            JSON.stringify(JSONStats.assetsByChunkName)
                                .replace(/{/g, '[')
                                .replace(/}/g, '];')
                                .replace(/":"/g, '"=>"')
                    );
                });
            },
            new webpack.ProvidePlugin(providePlugin)
        ],
        bail: process.argv.indexOf('--watch') == -1, // Do not tolerate errors if not in watch mode
        resolve:
        {
            modulesDirectories: ['node_modules'],
            extensions: ['', '.js', '.jsx', '.es6'],
            root: projectPath + '/',
            alias: require(path.join(projectPath, 'conf/webpack-alias.js'))
        },
        module:
        {
            noParse: /js\/lib\/(?!(dm\/))/,
            loaders: [
                {
                    test: /\.(jsx|es6)$/,
                    exclude: /node_modules/,
                    loaders: ['babel-loader?stage=0']
                }
            ]
        }
    };

module.exports = configuration;
