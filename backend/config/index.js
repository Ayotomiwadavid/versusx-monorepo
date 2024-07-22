const CONFIG = {
  FIREBASE: {
    apiKey: 'AIzaSyCbHhwS7kjq3s-zidpdk0THPugYTyzSqhI',
    authDomain: 'eskillz-pool.firebaseapp.com',
    databaseURL: 'https://eskillz-pool-default-rtdb.firebaseio.com',
    projectId: 'eskillz-pool',
    storageBucket: 'eskillz-pool.appspot.com',
    messagingSenderId: '285834418480',
    appId: '1:285834418480:web:86863685fac50c99e950f5',
    measurementId: 'G-7C45NW1VCC'
  },
  MYSQL: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'eskillzs_db'
    }
  }
};

module.exports = CONFIG;
