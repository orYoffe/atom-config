/* jshint node: true */

var webpack = require('webpack'),
    path = require('path'),
    fs = require('fs'),
    ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');

var projectPath = path.join(__dirname, '..'),
    baseConfPath = path.join(projectPath, '/cache/webpack_base_conf.json');

var manifestPath = 'cache/webpack_manifest-player-page-degraded.json';

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

var baseConf = JSON.parse(fs.readFileSync(baseConfPath)),
    outputPath = path.join(projectPath, baseConf.outputPath) + '-player-page-degraded',
    entryList = {'video_page-player-degraded': 'components/video-degraded/page-player-degraded/page-player-degraded.jsx',
    'search':              'components/search/search-router.jsx'},
    output =
    {
        path: outputPath,
        publicPath: baseConf.publicPath + '-player-page-degraded',
        filename: '[name].[chunkhash].js',
        chunkFilename: 'degraded-[id].[chunkhash].js'
    },
    configuration =
    {
        entry: entryList,
        output: output,
        recordsPath: path.join(projectPath, 'inc/dyn/webpack.records.json'), // allow to keep same chunk ordering in bundles across builds
        externals: {
            jquery: "jQuery"
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': "'" + process.env.NODE_ENV + "'"
                }
            }),
            new ChunkManifestPlugin(
            {
                // filename is relative to output.path
                filename: path.relative(outputPath, path.join(projectPath, manifestPath)),
                manifestVariable: '__webpack_manifest_degraded__'
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
                        path.join(projectPath, 'cache/webpack_files_map.conf-player-page-degraded.php'),
                        "<?php\nreturn " +
                            JSON.stringify(JSONStats.assetsByChunkName)
                                .replace(/{/g, '[')
                                .replace(/}/g, '];')
                                .replace(/":"/g, '"=>"')
                    );
                });
            }
            // new webpack.ProvidePlugin({
            //     $: 'jquery',
            //     jQuery: 'jquery',
            //     'window.jQuery': 'jquery'
            // })
        ],
        bail: process.argv.indexOf('--watch') == -1, // Do not tolerate errors if not in watch mode
        resolve:
        {
            modulesDirectories: ['node_modules'],
            extensions: ['', '.js', '.jsx', '.es6'],
            root: projectPath + '/',
            alias: {
                components: path.join(__dirname, '../components')
            }
        },
        module:
        {
            noParse: /js\/lib\/(?!(dm\/))/,
            loaders: [
                {test: /\.(jsx|es6)$/, loaders: ['babel-loader?stage=0']}
            ]
        }
    };

module.exports = configuration;
