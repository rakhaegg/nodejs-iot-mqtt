
require('dotenv').config()

const Hapi = require('@hapi/hapi')

const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://192.168.72.79:1883')
const topicTemperature = "node/temperature"
const topicHumditiy = "node/humidity"
const mq_sensor = "node/mq"
const flame_sensor = "node/flame"


var mongo = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
client.on('connect', function () {
    // client.subscribe('test', function(err ){
    //     if(!err){

    //     }
    // })

    client.subscribe([topicTemperature], () => {
        console.log(`Subscribe to '${topicTemperature}'`)
    })
    client.subscribe([topicHumditiy], () => {
        console.log(`Subscribe to '${topicHumditiy}'`)
    })
    client.subscribe([mq_sensor], () => {
        console.log(`Subscribe to '${mq_sensor}'`)
    })
    client.subscribe([flame_sensor], () => {
        console.log(`Subscribe to '${flame_sensor}'`)
    })
})


mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("fire");


    client.on('message', function (topic, message) {

        console.log('Received Message:', topic, message.toString())
        if (topic == topicHumditiy) {
            console.log("Humdity")
            const xx = {
                payload: message.toString(),
                timeField: new Date()
            }
            // 
            dbo.collection("humidity").insertOne(xx, function (err, res) {
                if (err) throw err;
                console.log("1 document Humidity inserted");
                //     // db.close();
            });
        } else if (topic == topicTemperature) {
            console.log("Temperature")
            const xx = {
                payload: message.toString(),
                timeField: new Date()
            }
            // 
            dbo.collection("temperature").insertOne(xx, function (err, res) {
                if (err) throw err;
                console.log("1 document Temperature inserted");
                //     // db.close();
            });
        } else if (topic == mq_sensor) {
            console.log("MQ Sensor")
            const xx = {
                payload: message.toString(),
                timeField: new Date()
            }
            // 
            dbo.collection("mq").insertOne(xx, function (err, res) {
                if (err) throw err;
                console.log("1 document MQ inserted");
                //     // db.close();
            });
        } else if (topic == flame_sensor) {
            console.log("Flame Sensor")
            const xx = {
                payload: message.toString(),
                timeField: new Date()
            }
            // 
            dbo.collection("flame").insertOne(xx, function (err, res) {
                if (err) throw err;
                console.log("1 document Flame inserted");
                //     // db.close();
            });
        }
    })
})


const init = async () => {
    const dbOpts = {
        url: 'mongodb://localhost:27017/fire',

        decorate: true
    };
    const server = Hapi.server({
        port: 3003,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*']
            }
        }
    })
    await server.register({
        plugin: require('hapi-mongodb'),
        options: dbOpts
    })
    server.route({
        method: 'GET',
        path: '/api/temperature',
        handler: async (req, h) => {
            const temperature = await req.mongo.db.collection('temperature').find({}).toArray()
            return temperature;
        }
    })
    await server.start();
    console.log("Server Running On %s", server.info.uri);
}

init();
