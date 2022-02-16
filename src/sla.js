import { Template, Clause } from '@accordproject/cicero-core';
import Engine  from '@accordproject/cicero-engine';
import fs from 'fs';

export default class SLA{

    constructor(){
        this.engine = new Engine.Engine();
    }

    setTemplateFromLocalArchive = async (localPath) => {
        // Reads Local .cta 
        var localFile = fs.readFileSync(localPath);

        // Load Template
        this.template = await Template.fromArchive(localFile);

        // resets clause and clause data
        this.clause = undefined;
    }

    setTemplateFromURL = async (templateUrl) => {
        this.template = await Template.fromUrl(templateUrl);
        this.clause = undefined; // resets clause 
    }

    getTemplateMetadata(){
        return { metadata: this.template.getMetadata() };
    }

    setClause(){
        this.clause = new Clause(this.template);
    }

    setClauseData(reqBodyData){
        this.setClause();
        this.clause.setData(reqBodyData);
    }

    getClauseData(){
        return this.clause ? this.clause.getData() : {};
    }

    engineTrigger = async (request, state) => {
        if (!this.clause) this.setClause();
        const result = await this.engine.trigger(this.clause, request, state);
        return result;
    }
}