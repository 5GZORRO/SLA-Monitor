import axios from 'axios';
export default class External{
    async fetchSLA(slaId){
        const slaUrl = process.env.SCLCM_URL + slaId
        const sla = await this.makeGetRequest(slaUrl)
        if (sla != undefined) return sla;
        return;

        // No longer fetching Product from TMF. Now we have the SLA_ID to be used directly to SCLCM
        /* const productUrl = process.env.TMF_URL + productId
        const product = await this.makeGetRequest(productUrl) // Fetch Product with the productId
        if(product != undefined) {
            if (product.serviceLevelAgreement == undefined) {
                console.log("Fetched product has no SLA field")
                return;
            }
            const slaHref = product.serviceLevelAgreement.href // Remove sla Href which is the path to fetch the SLA from.
            
            if(slaHref != ''){ // If SLA href is present
                const sla = await this.makeGetRequest(slaHref)
                if (sla != undefined) return sla;
            }
        }*/
    }

    async subscribeDL(productId){
        const subscribeUrl = process.env.DL_SUB_URL + productId
        const data = { "userInfo": { "userId":  process.env.DL_USER_ID, "authToken": "blah" }, "productInfo": { "topic": process.env.KAFKA_TOPIC_IN } }
        const headers = {'Content-Type': 'application/json' }
        await this.makePostRequest(subscribeUrl, data, headers) // Subscribe to certain product in Datalake
    }

    // Method used to Wrongly notify SCLCM directly instead of them subscribing to kafka topic
    async sclcmNotification(productOrderDID, slaDID, state){
        const data = { "productOrderDID": productOrderDID, "serviceLevelAgreementDID": slaDID, "state": state }
        const headers = {'Content-Type': 'application/json' }
        await this.makePatchRequest(process.env.SCLCM_URL, data, headers) // Send Patch request to SCLCM
      }

    async makePostRequest(url, data, headers){
        console.log("POST Request to: " + url)
        let response = await axios.post(url, data, headers).catch(error => console.log(error));
        if (response != undefined) {
            console.log(response.status)
            if(response.status == 200) return response.data;
        }
      }

    async makePatchRequest(url, data, headers){
        console.log("PATCH Request to: " + url)
        let response = await axios.patch(url, data, headers).catch(error => console.log(error));
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
