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
  const kafka_consumer_sla = new KafkaConsumer(kafkaConfig, "n");
  kafka_consumer_sla.listenNewSla(kafka_topic_sla, false); 

  // Listen to monitoring data
  const kafka_consumer_in = new KafkaConsumer(kafkaConfig, "v");
  kafka_consumer_in.listenMonitor(kafka_topic_in, false); 


  // Test
  const kafkaProducer = new KafkaProducer(kafkaConfig);
  kafkaProducer.sendMessage(kafka_topic_sla, '{ "eventType": "new_SLA", "transactionID": "2815f0260bf1447ebc7bc89ff52fb986", "productID": "P44RJzPQ9NWPE7QTDX4ZhA", "SLAID": "3GsEZiQpr8PxCDYe1Sx2vX", "instanceID": "105" }');

});


// Test Data that creates violation
/*async function test() {
  const kafkaProducer = new KafkaProducer(kafkaConfig);
  for (var i = 0; i < 5; i++) {
    kafkaProducer.sendMessage(kafka_topic_in, '{"operatorID":"operator-a","transactionID":"46da2e15efc340cd9ae9d6363a0e8d1d","networkID":"6350ff52cd26c7000c33ef94","monitoringData":{"metricName":"location_latitude_coord","metricValue":55.194756,"resourceID":"161","instanceID":"6350ff52cd26c7000c33ef94","productID":"P44RJzPQ9NWPE7QTDX4ZhA","timestamp":"2022-10-21 08:43:33.533028"}}');
    await delay(5000);
  }
}  



function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}*/