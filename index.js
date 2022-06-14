import express from 'express';
import pkg from 'kafkajs';
const { Kafka } = pkg;
import KafkaConsumer from './src/consumer.js';
import KafkaProducer from './src/producer.js';


const app = express();
const port = 8080;

// Env Vars
var kafka_topic_in = process.env.KAFKA_TOPIC_IN 
var kafka_topic_sla = process.env.KAFKA_TOPIC_SLA
var kafka_host = process.env.KAFKA_HOST 


// Kafka configuration
const kafkaConfig = new Kafka({
  clientId: "sla-monitor",
  brokers: [kafka_host]
})


app.listen(port, () => {
  console.log(`server is up on port ${port}`);

  // Listen to new SLA events
  const kafka_consumer_sla = new KafkaConsumer(kafkaConfig, "new_sla");
  kafka_consumer_sla.listenNewSla(kafka_topic_sla, true); 

  // Listen to monitoring data
  const kafka_consumer_in = new KafkaConsumer(kafkaConfig, "monitoring");
  kafka_consumer_in.listenMonitor(kafka_topic_in, true); 
});

/*
app.get('/', (req, res) => {
    
  const data = {
    "eventType": "new_SLA_ACK",
    "transactionID": "5f1da43fcc3c46809ce70b3186d0d2cd",
    "productID": "c6021d08-b934-492f-becb-59543aa9e4b6",
    "status": "COMPLETED"
  }


  const producer = new KafkaProducer(kafkaConfig)
  //producer.sendMessage(kafka_topic_sla, JSON.stringify(data))


  const data2 = { // 500 > 1600 + 100 -> NO violation
    "operatorID" : "id_example",
    "networkID" :  "network_slice_id",
    "monitoringData" :  
    {
        "metricName" :  "osm_requests",
        "metricValue" :  "500",
        "transactionID" :  "7777",
        "productID" :  "c6021d08-b934-492f-becb-59543aa9e4b6",
        "instanceID" : "2",
        "resourceID" : "X",
        "timestamp": "2022-03-10"
    },
  }
  producer.sendMessage(kafka_topic_in, JSON.stringify(data2))

  const data3 = { // 2000 > 1600 + 100 -> Violation
    "operatorID" : "id_example",
    "networkID" :  "network_slice_id",
    "monitoringData" :  
    {
        "metricName" :  "osm_requests",
        "metricValue" :  "2000",
        "transactionID" :  "7777",
        "productID" :  "c6021d08-b934-492f-becb-59543aa9e4b6",
        "instanceID" : "2",
        "resourceID" : "X",
        "timestamp": "2022-03-10"
    },
  }

  producer.sendMessage(kafka_topic_in, JSON.stringify(data3))
})*/