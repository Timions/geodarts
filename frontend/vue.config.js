const path=require('path');

module.exports = {
  outputDir: path.resolve(__dirname, '../src/public'),
  devServer:{
    proxy: 'http://localhost:8080',
    port: 4000
  },
  "transpileDependencies": [
    "vuetify"
  ],

}