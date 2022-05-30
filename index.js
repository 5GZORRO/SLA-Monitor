import express from 'express';
import { Kafka } from 'kafkajs';
import KafkaConsumer from './src/consumer.js';


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
