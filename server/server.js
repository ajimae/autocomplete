const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({ hosts: ['http://localhost:9200'] });
const express = require('express');
const bodybuilder = require('bodybuilder')

const app = express();
const bodyParser = require('body-parser')

client.ping({
    requestTimeout: 30000,
}, function(error, response, status) {
    if (error) {
        console.info('elasticsearch cluster is down! ' + response + ' ' + (status || ''));
        process.exit(0);
    } else {
        console.info('Everything is ok');
    }
});


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', process.env.PORT || 3001);
// app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function(req, res) {
    res.status(200).json({
        message: 'welcome to automcomplete elasticsearch server',
        data: []
    })
})

// app.get('/v2', function (req, res) {
//     res.sendFile('template2.html', {
//         root: path.join(__dirname, 'views')
//     });
// })

app.get('/search', function(req, res) {
    
    // use query builder
    const query = bodybuilder().query('match', 'name', req.query['q']).build()

    let body = {
        size: 200,
        from: 0,
        // query: {
        //     match: {
        //         name: req.query['q']
        //     }
        // },
        ...query,
        highlight: {
            pre_tags: ["<span style='background:yellow'>"],
            post_tags: ['</span>'],
            fields: {
                "name": { number_of_fragments: 0 }
            }
        }
    }
    console.log(body)
    client.search({
        index: 'autocomplete',
        body: body,
        type: 'cities_list'
    })
        .then(results => {
            res.status(200).json({
                status: 'success',
                data: results.hits.hits
            })
        })
        .catch(err => {
            console.error(err)
            res.send([]);
        });

})






app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});