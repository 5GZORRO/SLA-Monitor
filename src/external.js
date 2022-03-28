import axios from 'axios';
export default class External{

    async fetchSLA(productId){
        
        const productUrl = process.env.TMF_URL + productId
        const product = await this.makeGetRequest(productUrl) // Fetch Product with the productId
        if(product != undefined) {
            const slaHref = product.serviceLevelAgreement.href // Remove sla Href which is the path to fetch the SLA from.
            
            if(slaHref != ''){ // If SLA href is present
                const sla = await this.makeGetRequest(slaHref)
                if (sla != undefined) return sla;
            }
        }
        return;
    }

    async subscribeDL(productId){

        const subscribeUrl = process.env.DL_SUB_URL + productId
        const data = { "userInfo": { "userId":  process.env.DL_USER_ID, "authToken": "blah" }, "productInfo": { "topic": process.env.KAFKA_TOPIC_IN } }
        const headers = {'Content-Type': 'application/json' }
        const response = await this.makePostRequest(subscribeUrl, data, headers) // Subscribe to certain product in Datalake
    }


    async makePostRequest(url, data, headers){
        console.log("POST Request to: " + url)
        let response = await axios.post(url, data, headers).catch(error => console.log(error));
        if (response != undefined) {
            console.log(response.status)
            if(response.status == 200) return response.data;
        }
      }


    async makeGetRequest(url){
        console.log("GET Request to: " + url)
        let response = await axios.get(url).catch(error => console.log(error));
        if (response != undefined){ 
            console.log(response.status)
            if (response.status == 200) return response.data;
        }
      }
}
