export default class KafkaProducer{
  
  constructor(kafka){
    this.kafka = kafka;
    this.producer = kafka.producer()
  }

  sendMessage = async (topic, message) => {
    await this.producer.connect()
    await this.producer.send({
      topic: topic,
      messages: [
        { value: message },
      ],
    })
    
    await this.producer.disconnect()
  }
}
