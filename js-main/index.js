if (process.env.NODE_ENV === 'development') {
  require('@babel/register')({
    extensions: ['.js', '.ts'],
  })
  require('./src')
} else {
  require('./lib')
}
