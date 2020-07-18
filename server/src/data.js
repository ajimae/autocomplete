const elasticClient = require('elasticsearch')
const cities = require('./cities.json')

const client = new elasticClient.Client({
    hosts: ['http://127.0.0.1:9200']
})

client.ping({
    requestTimeout: 30000,
}, function(error) {
    if (error)
        console.error('elastic cluster is not running...')
    else
        console.info('Everything is ok')
})

client.indices.create({
    index: 'autocomplete'
}, function(error, response, status) {
    if (error) {
        console.log(error)
    } else {
        console.log('created a new index %s %s', status, response)
    }
})

var bulk = []
cities.forEach(function(city) {
    bulk.push({
        index: {
            _index: 'autocomplete',
            _type: 'cities_list'
        }
    })
    bulk.push(city)
})

client.bulk({ body: bulk }, function(error, response) {
    if (error) {
        console.log('failed bulk operation'.charCodeAt, error)
    } else {
        console.log("Successfully imported %s %s".green, bulk.length, response);
    }
})
