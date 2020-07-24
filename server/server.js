const elasticsearch = require('elasticsearch');
// const client = new elasticsearch.Client({ hosts: ['http://localhost:9200'] });
const client = new elasticsearch.Client({ hosts: ['http://0.0.0.0:9200'] });
const express = require('express');
const bodybuilder = require('bodybuilder')

const app = express();
const bodyParser = require('body-parser')

// client.ping({
//     requestTimeout: 30000,
// }, function(error, response, status) {
//     if (error) {
//         console.info('elasticsearch cluster is down! ' + response + ' ' + (status || ''));
//         process.exit(0);
//     } else {
//         console.info('Everything is ok');
//     }
// });

try {
    client.ping({
        requestTimeout: 30000
    }, function(error, response, status) {
        if (error) {
            console.error('elastic search is not ready or is down', response, (status || ''))
        } else {
            console.log('elastic search service is ready to recieve requests')
        }
    })
} catch (error) {
    console.error('' + error.message)
}


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', process.env.PORT || 3001);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

app.post('/index', function(req, res) {

})

app.delete('/delete', function(req, res) {
    const { index } = req.body;
    console.log(index, ['index']);
    try {
        if (client.indices.exists({ index })) {
            client.indices.delete({ index });

            res.status(200).json({
                message: "index deleted successfully",
                data: []
            })
        } else {
            res.status(404).json({
                message: "index not found",
                data: []
            })
        }
    } catch (error) {
        console.error(error.message)
    }
})

app.get('/search', function(req, res) {

    // use query builder
    // const query = bodybuilder().query('match', 'city', (req.query['q']).toUpperCase()).build()
    // const query = {
    //     "query": {
    //         "query_string": {
    //             "default_field": "city",
    //             "query": req.query.q,
    //             "default_operator": "AND"
    //         }
    //     },
    //     "sort": [
    //         {
    //             "city.keyword": {
    //                 "order": "asc"
    //             }
    //         }
    //     ],
    //     "_source": ["city", "post_code", "lg", "state", "allstates_id"]
    // }
    const q = req.query.q.length ? "*" + req.query.q + "*" : ""
    const query = {
        "query": {
            "query_string": {
                "query": q,
                "fields": [
                    "city"
                ]
            }
        },
        "sort": [
            "_score",
            {
                "city": {
                    "order": "desc"
                }
            }
        ],
        // "from": 0,
        // "size": 5
    }

    console.log(query)
    let body = {
        size: 200,
        from: 0,
        ...query,
        highlight: {
            pre_tags: ["<span style='background:yellow'>"],
            post_tags: ['</span>'],
            fields: {
                "city": { number_of_fragments: 0 }
            }
        }
    }

    client.search({
        index: 'autocomplete',
        body: body,
        // type: 'cities_list'
    })
        .then(results => {
            // console.log(results, '>>>>')
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