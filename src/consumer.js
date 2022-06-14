import External from './external.js';
import redisClient from "./redis.js"
import KafkaProducer from './producer.js';
import uuidv4 from 'uuid';


var kafka_topic_out = process.env.KAFKA_TOPIC_OUT

export default class KafkaConsumer{

  constructor(kafka, groupId){
    this.kafka = kafka
    this.consumer = kafka.consumer({ groupId: groupId })
  }
  
  // Consumer for New SLA Events
  listenNewSla = async (topic, fromBeginning) => { 
    await this.consumer.connect()
    await this.consumer.subscribe({ topic: topic, fromBeginning: fromBeginning })
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("New SLA Data Event: ", message.value.toString())

        const messageJson = JSON.parse(message.value.toString()) 
        const productId = messageJson.productID // Retrieve the ProductID from the New SLA Event
        if (this.isFieldInvalid(productId)) return;

        const sla = await this.getSLA(productId) 
        if (sla == null) return;

        await new External().subscribeDL(productId) // Subscribe to the Datalake Product
      },
    })
  }

  // Consumer for Monitoring data Events
  listenMonitor = async (topic, fromBeginning) => {
    await this.consumer.connect()
    await this.consumer.subscribe({ topic: topic, fromBeginning: fromBeginning })
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("New Monitoring Data Event: ", message.value.toString() )
        
        // Get and validate Data from the monitoring data event
        const messageJson = JSON.parse(message.value.toString()) 
        const productId = messageJson.monitoringData.productID 
        if (this.isFieldInvalid(productId)) return;

        const value = messageJson.monitoringData.metricValue
        if (this.isFieldInvalid(value)) return;
        
        const metricName = messageJson.monitoringData.metricName 
        if (this.isFieldInvalid(metricName)) return;

        // Get SLA
        let sla = await this.getSLA(productId)
        if (sla == null) return;

        // Extract data from SLA     
        const rules = sla.rule
        if (this.isFieldInvalid(rules)) return;

        const slaId = sla.id
        if (this.isFieldInvalid(slaId)) return;

        const slaHref = sla.href
        if (this.isFieldInvalid(slaHref)) return; 

        // SLAs can have several rules, so we fetch the correct one
        const rule = this.getRuleByMetricName(metricName, rules)
        if (rule == null) return; // SLA doesnt have that metric


        // Get Rule information from SLA
        const operator = rule.operator
        const reference = parseFloat(rule.referenceValue)
        const tolerance = parseFloat(rule.tolerance)
        if (this.isFieldInvalid(operator) || isNaN(reference) || isNaN(tolerance)) return;

        // Check for Violations
        const isViolated = this.isViolated(operator, reference, value, tolerance)
        if (isViolated == null) return;  // If there is an unknown operator

        if (isViolated){
          const violation = this.createViolation(productId, slaId, slaHref, rule, value)
          console.log("Violation Occurred: "+JSON.stringify(violation, null, 2))
        
          const kafkaProducer = new KafkaProducer(this.kafka);
          kafkaProducer.sendMessage(kafka_topic_out, JSON.stringify(violation));
        } 
        
        else console.log("No violation")
        return;
      },
    })
  }


  // Method that fetches the SLA either from Redis or from HTTP Requests to external components
  async getSLA(productId){
    await redisClient.createClient()
    const slaRedis = await redisClient.read(productId)
    
    if (slaRedis == null){ 
      console.log("SLA with productId: " + productId + " doesn't exist on Redis")
      const sla = await new External().fetchSLA(productId) // Get the SLA from SCLCM

      if(sla == undefined){ 
        console.log("Error fetching the SLA with productId: " + productId)
        return null;       
      }   
      await redisClient.create(productId, JSON.stringify(sla)) // Store SLA
      return sla
    }
    return JSON.parse(slaRedis)
  }

  // Method that verifies if the field is undefined or empty
  isFieldInvalid(field){
    if(field == undefined || field == '') {
      console.log("Error fetching the field: undefined or empty")
      return true;
    }
    return false;  
  }

  // Method that verifies if a violation occurred
  isViolated(operator, reference, value, tolerance){  // If true -> Violated  
    switch (operator) {
      case '.g':
        return value > reference + tolerance // 2600r/m > 2600 + 100 -> Violated
      case '.ge':
        return value >= reference + tolerance // 95ms >= 85 + 5 -> Violated 
      case '.l':
        return value < reference - tolerance
      case '.le':
        return value <= reference - tolerance // 80% <= 99.95 - 0.05  -> Violated
      case '.eq':
        return reference - value == 0
      default:
        console.log("Error while comparing rules: Operator not found")
        return null;
    }
  }

  // Method that extracts a specific rule from the array of rules based on the metric name
  getRuleByMetricName(metricName, rules){
    for (let pos in rules){
      let rule = rules[pos]
      if (rule.metric == metricName) return rule
    }
    console.log("Rule with metricName: " + metricName + " Not Found")
    return null
  }

  // Method that creates the violation json
  createViolation(productId, slaId, slaHref, rule, value){
    return {
      "id": uuidv4(),
      "productDID": productId, 
      "sla": { "id": slaId, "href": slaHref },
      "rule": rule,
      "violation": { "actualValue": value }
    }
  }
}