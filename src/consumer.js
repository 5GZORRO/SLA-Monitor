export default class KafkaConsumer{

  constructor(kafka, groupId){
    this.kafka = kafka
    this.consumer = kafka.consumer({ groupId: groupId })
  }
  
  listen = async (topic, fromBeginning) => {
    await this.consumer.connect()
    await this.consumer.subscribe({ topic: topic, fromBeginning: fromBeginning })
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("------> Monitoring Data Event: ", message.value.toString() )
      },
    })
  }
}