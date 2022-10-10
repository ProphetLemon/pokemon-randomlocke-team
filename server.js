const express = require('express');
const app = express();
var path = require('path');
require('dotenv').config();
const methodOverride = require('method-override');
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'src')));


app.get('/', (req, res) => {
    res.render('index');
});

app.listen(process.env.PORT || 5000);