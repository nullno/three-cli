const path = require('path');
const HWP = require('html-webpack-plugin');
const { CleanWebpackPlugin  } = require('clean-webpack-plugin');
const UglifyJsPlugin  = require('uglifyjs-webpack-plugin')


const uglifyJs = new UglifyJsPlugin({
                        parallel: true,
                        sourceMap:true,
                        uglifyOptions: {
                          warnings: false,
                          // 删除注释
                          output:{
                            comments:false,
                          },
                          compress:{
                             drop_console: true,//console
                             pure_funcs: ['console.log']//移除console

                          }
                      }
                     });

const webpackConfig  = {
   mode: 'production',
   entry: {
     app: './src/index.js',
   },
   output: {
    filename: './assets/[name]-[hash:5].js',
    path: path.resolve(__dirname, 'release/three-demo'),
    /*只打包three.js 库使用*/
    // library: 'THREE', 
    // libraryTarget: 'umd',
    // globalObject: 'this'
    // libraryExport: 'default',
   },
   plugins:[
    new CleanWebpackPlugin(),
    new HWP({
       title:'古董物件鉴赏-3D',
       template:'./src/html/index.ejs',
    })
   ],
    optimization: {
        // minimizer: [uglifyJs],
        splitChunks:{
            cacheGroups:{//设置缓存组用来抽取满足不同规则的chunk
                  vendors: { // 基本框架
                     chunks: 'all',
                     test: /node_modules/,
                     priority: 10,
                     name: 'chunk-vendors',
                  },
                  // other: { // 其他同步加载公共包
                  //   chunks: 'all',
                  //   minChunks: 2,
                  //   name: 'other',
                  //   priority: 80,
                  //  },
            }
        }
    },
   module: {
        rules: [
        {
        	test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {test:/\.(ttf|woff|woff2|eot|svg|gltf|glb|fbx|hdr|bin)$/,use:{
                                                                      loader: 'file-loader',
                                                                      options: {
                                                                        name: './assets/[name].[ext]',
                                                                      }
                                                                      }
                                                        },
        {test:/\.(png|gif|jpg|jpeg)$/,use:{
                                               loader: 'file-loader',
                                               options: {
                                                 name: './assets/textures/[name].[ext]',
                                               }
                                           }
                                         },                                                      
        ],
    },

    stats:{
        version: true,
    }

};


module.exports = webpackConfig;