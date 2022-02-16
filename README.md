# SLA-Monitor
Repository for the SLA-Monitor component

## API

Code divided into 3 modules. 
```
consumer.js - Contains logic for a kafka consumer
producer.js - Contains logic for a kafka producer
sla.js - Contains logic for Accord Project
```
In the index.js we do the following:

For the Kafka logic, we create a consumer and set it to listen on the topic provided by the datalake. (For testing use, we listen and consume the output kafka topic)
After that we create a producer and send a message to that topic.

As to the Accord logic, it is currently commented. However we basically:

1. Instantiate the SLA Engine
```
const sla = new SLA();
```

2. Set the Template (For testing scenario we use a local template)
```
await sla.setTemplateFromLocalArchive('./examples/full-payment-upon-demand@0.9.0.cta');
```
3. Set Clauses Data 
```
const clauseJson = {
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
  $identifier: "d3b7e05a-d889-4604-b4bf-3c72eb773d4c", },};


sla.setClauseData(clauseJson.data);
```
4. Trigger the Logic
```
var requestJson = {
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
};

const result = await sla.engineTrigger(requestJson.request, requestJson.state);
```

## Logic (Still incomplete)

0. Connect to kafka topic in the datalake
1. Monitoring Data Event Arrives (Kafka)
2. Retrieve the ProductId from the Event
3. Get the Product from the TMF Catalog API using this ProductId
4. Retrieve the SLA id from the Product 
5. Get the SLA from the SCLM component using the SLA Id



## Logic Expanded

2. From the Monitoring Data Event that is consumed from the Kafka Topic, that is produced by the MDA, we fetch the **ProductId**.
```
Monitoring data event Example

data = {
    "operatorID" : "id_example",
    "networkID" :  "network_slice_id",
    "monitoringData" :  
    {
        "metricName" :  "http://www.provider.com/metrics/availability",
        "metricValue" :  "0.453",
        "transactionID" :  "7777",
        "productID" :  "8888",
        "instanceID" : "2",
        "resourceID" : "X",
        "timestamp": "the time which the metric was measured"
    },
}
```

3. The **ProductId** is used to get the Product from the TMF Catalog which has a **ServiceLevelAgreement** Field.
```
  TMF Catalog API URL

  GET /tmf-api/productCatalogManagement/v4/productOffering/{id}
```

```
  SLA field from Product 

  ...
  "serviceLevelAgreement": {
    "@baseType": "string",
    "@referredType": "string",
    "@schemaLocation": "string",
    "@type": "string",
    "description": "string",
    "href": "string",
    "id": "string",
    "lastUpdate": "string",
    "lifecycleStatus": "string",
    "lifecycleStatusEnum": "Active",
    "name": "string",
    "validFor": {
      "endDateTime": "string",
      "startDateTime": "string"
    },
    "version": "string"
  }
```

4. From the Product, we retrieve the **Sla Id** which will be used to fetch the SLA Template and its clauses from either the SCLCM or the LPR components.

5. Using the **SLA Id**, we fetch the SLA from the SCLM component.

```
  SCLM API URL

  GET ...
```

```
  SLA from SCLM 

{
  "id": "string",
  "href": "string",
  "name": "string",
  "description": "string",
  "version": "string",
  "validFor": {
    "endDateTime": "string",
    "startDateTime": "string"
  },
  "templateRef": {
    "href": "string",
    "name": "string",
    "description": "string"
  },
  "state": "string",
  "approved": true,
  "approvalDate": "2022-01-04T15:04:51.074Z",
  "rule": [
    {
      "id": "string",
      "metric": "string",
      "unit": "string",
      "referenceValue": "string",
      "operator": "string",
      "tolerance": "string",
      "consequence": "string"
    }
  ],
  "relatedParty": [
    {
      "href": "string",
      "role": "string",
      "name": "string",
      "validFor": {
        "endDateTime": "string",
        "startDateTime": "string"
      } } ] }
```





# Datalake Interaction
Firstly, we need to register a user
```
  curl -i -H "Content-Type: application/json" -X POST -d ' { "userId": "sla-monitor", "authToken": "blah" } ' 172.28.3.94:8080/datalake/v1/user
```

Answer:
```
  HTTP/1.0 201 CREATED
  Content-Type: application/json
  Content-Length: 545
  Server: Werkzeug/1.0.1 Python/3.8.10
  Date: Mon, 20 Dec 2021 09:56:23 GMT

  {
    "availableResources": {
      "pipelines": {
        "resourceMetricsIngestPipeline": "sla-monitor-in-0"
      },
      "s3_bucket": "sla-monitor-dl-bucket",
      "topics": {
        "userInTopic": "sla-monitor-topic-in",
        "userOutTopic": "sla-monitor-topic-out"
      },
      "urls": {
        "dl_catalog_server_url": "172.28.3.46:32579",
        "dl_stream_data_server_url": "172.28.3.46:30887",
        "k8s_url": "172.28.3.46:6443",
        "kafka_url": "172.28.3.196:9092",
        "s3_url": "172.28.3.188:9000"
      }
    },
    "nameSpace": "sla-monitor"
  }
```


Ask the datalake for a certain productID stream
The datalake will fetch those topics and copy them to our input topic


Check all users
```
  curl -i -H "Content-Type: application/json" -X GET -d ' { "userId": "sla-monitor", "authToken": "blah" } ' 172.28.3.94:8080/datalake/v1/user/all
```






# How logic should be using Accord Project
0. Monitoring Data arrives and we fetch the template
1. Instantiate Template
2. Add Clauses
3. Trigger the Logic (Previously implemented in the Template) using the monitoring data event
4. If needed, Emit a Violation

## SLA Info Example

Clause Example to fill an SLA Template
```
  const clauseJson = {
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
```

Request Example to Trigger an SLA 
```
  var requestJson = {
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
  };
```
