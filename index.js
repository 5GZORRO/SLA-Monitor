import express from 'express';
import { Kafka } from 'kafkajs';
import KafkaConsumer from './src/consumer.js';
import External from './src/external.js';
import KafkaProducer from './src/producer.js';
import redisClient from './src/redis.js';
import SLA from './src/sla.js';


const app = express();
const port = 8080;

// Env Vars
var group_id = process.env.KAFKA_GROUP_ID 
var kafka_topic_in = process.env.KAFKA_TOPIC_IN 
var kafka_topic_out = process.env.KAFKA_TOPIC_OUT
var kafka_topic_sla = process.env.KAFKA_TOPIC_SLA
var kafka_host = process.env.KAFKA_HOST 


// Kafka configuration
const kafkaConfig = new Kafka({
  clientId: "sla-monitor",
  brokers: [kafka_host]
})




app.get('/', async (req, res) => {});

function http_and_redis_logic(){
  /*
  const productId = '849927c4-c24f-48b1-9b9e-f9897f3d7362' 
  const sla = await new External().fetchSLA(productId)
  if(sla != undefined){ 

    await redisClient.createClient()
    await redisClient.create(productId, JSON.stringify(sla)) // Save SLA as a String
    //const valueString = await redisClient.read(productId) 
    //const value = JSON.parse(valueString)  // Parse back to JSON

   await new External().subscribeDL(productId)
  }
  */
}

function kafka_logic(){
  // Creates a Kafka Consumer
  // const kafkaConsumer = new KafkaConsumer(kafkaConfig, group_id);

  // Listen on a topic
  // kafkaConsumer.listenMonitor(kafka_topic_in, true);

  // Creates a Kafka Producer
  // const kafkaProducer = new KafkaProducer(kafkaConfig);

  // Produces a Message
  // kafkaProducer.sendMessage(kafka_topic_out, 'Hello World!');
}

function sla_logic() { 
  // Clause JSON Data
  /*const clauseJson = {
    data: {
      $class:
      "org.accordproject.payment.fullupondemand.FullPaymentUponDemandTemplate",
      buyer: "resource:org.accordproject.party.Party#Dan",
      seller: "resource:org.accordproject.party.Party#Jerome",
      value: {
      $class: "org.accordproject.money.MonetaryAmount",
      doubleValue: 3.14,
      currencyCode: "EUR",
    },
    contractId: "d3b7e05a-d889-4604-b4bf-3c72eb773d4c",
    $identifier: "d3b7e05a-d889-4604-b4bf-3c72eb773d4c",
  },
  };
  */

  // Request to execute
  /*var requestJson = {
    request: {
    $class: "org.accordproject.payment.fullupondemand.PaymentDemand",
    $timestamp: "2021-04-27T13:10:37.715-04:00",
    },
    state: {
    $class:
        "org.accordproject.payment.fullupondemand.FullPaymentUponDemandState",
    status: "INITIALIZED",
    $identifier: "7c89e540-a77b-11eb-9770-7ddd576a12c2",
    },
    contractId: "d3b7e05a-d889-4604-b4bf-3c72eb773d4c",
  };*/
  
  
  // Create Engine
  //const sla = new SLA();

  // Set Template locally
  //await sla.setTemplateFromLocalArchive('./examples/full-payment-upon-demand@0.9.0.cta');
  
  // Set Clause Data
  //sla.setClauseData(clauseJson.data);

  // Trigger Logic
  //const result = await sla.engineTrigger(requestJson.request, requestJson.state);
}



app.listen(port, () => {
  console.log(`server is up on port ${port}`);

    // Creates a Kafka Consumer
    const kafkaConsumer = new KafkaConsumer(kafkaConfig, group_id);

    // Listen on a topic
    kafkaConsumer.listenNewSla(kafka_topic_sla, true);
});
