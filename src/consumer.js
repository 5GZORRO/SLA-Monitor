import External from './external.js';
import redisClient from "./redis.js"


export default class KafkaConsumer{

  constructor(kafka, groupId){
    this.kafka = kafka
    this.consumer = kafka.consumer({ groupId: groupId })
  }
  
  listenNewSla = async (topic, fromBeginning) => { // Consumer for New SLA Event
    await this.consumer.connect()
    await this.consumer.subscribe({ topic: topic, fromBeginning: fromBeginning })
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {

        console.log("New SLA Data Event: ", message.value.toString())

        const message_json = JSON.parse(message.value.toString()) // Parse to JSON
        const productId = message_json.productID // Retrieve the ProductID from the New SLA Event

        if(productId != undefined && productId != ''){
          const sla = await new External().fetchSLA(productId) // Get the SLA
          if(sla != undefined){ 
  
            await redisClient.createClient()
            await redisClient.create(productId, JSON.stringify(sla)) // Store SLA
            
            await new External().subscribeDL(productId) // Subscribe to the Datalake Product
          }
        }
      },
    })
  }


  listenMonitor = async (topic, fromBeginning) => {
    await this.consumer.connect()
    await this.consumer.subscribe({ topic: topic, fromBeginning: fromBeginning })
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("New Monitoring Data Event: ", message.value.toString() )
      },
    })
  }
}