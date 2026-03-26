const mongoose = require('mongoose');
mongoose.connect('mongodb://tharuka:QWEGKi9xlNU6eRvR@cluster0-shard-00-00.6wtzz.mongodb.net:27017,cluster0-shard-00-01.6wtzz.mongodb.net:27017,cluster0-shard-00-02.6wtzz.mongodb.net:27017/unihub?ssl=true&replicaSet=atlas-2z6wtz-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0', { family: 4 })
.then(() => {
  console.log('Connected');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
