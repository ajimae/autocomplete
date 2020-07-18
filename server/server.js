// const elasticClient = require('elasticsearch')
// const cities = require('./cities.json')

// const client = new elasticClient.Client({
//     hosts: ['http://127.0.0.1:9200']
// })

// // ping the client to be sure elasticsearch is up and running
// client.ping({
//     requestTimeout: 30000,
// }, function (error) {
//     if (error)
//         console.error('elastic cluster is not running...')
//     else
//         console.info('Everything is ok')
// })

// client.indices.create({
//     index: 'autocomplete'
// }, function (error, response, status) {
//     if (error) {
//         console.log(error)
//     } else {
//         console.log('created a new index', response)
//     }
// })

// var bulk = []
// cities.forEach(function (city) {
//     bulk.push({
//         index: {
//             _index: 'autocomplete',
//             _type: 'cities_list'
//         }
//     })
//     bulk.push(city)
// })

// client.bulk({ body: bulk }, function (error, response) {
//     if (error) {
//         console.log('failed bulk operation'.charCodeAt, error)
//     }
// })

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    hosts: ['http://localhost:9200']
});
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const path = require('path');
client.ping({
    requestTimeout: 30000,
}, function (error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({  extended: true }))
app.set('port', process.env.PORT || 3001);
// app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    // res.send('Hello...');
    res.status(200).json({
        message: 'welcome to automcomplete server',
        data: []
    })
})

// app.get('/v2', function (req, res) {
//     res.sendFile('template2.html', {
//         root: path.join(__dirname, 'views')
//     });
// })

app.get('/search', function (req, res) {

    let body = {
        size: 200,
        from: 0,
        query: {
            match: {
                name: req.query['q']
            }
        }
    }

    client.search({ index: 'autocomplete', body: body, type: 'cities_list' })
        .then(results => {
            // res.send(results.hits.hits);
            res.status(200).json({
                status: 'success',
                data: results.hits.hits
            })
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });

})






app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});