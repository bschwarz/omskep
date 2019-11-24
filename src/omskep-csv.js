//
// This file contains both the Swagger/OpenAPI and RAML methods that get mixed in
// to the classes
//

const od = require('./omskep-data.js');

let csv = {
   
    /**
    * Retrieves the title for the API from the openapi3 document
    */
    getTitle() {
        return this.filename ? this.filename.split('-').shift() : '';
    },
    /**
    * Retrieves the version for the API from the openapi3 document
    */
    getVersion() {
        let x = this.filename ? this.filename.split('-') : [];
        return x[1].replace(/(v|V)([.0-9]+)\.[a-zA-Z]+/, '$2');
        //return x[1] ? x[1].split('.').slice(0,-1).join('.').replace(/v|V/, '') : '';
    },
   /**
    * Gets all the possible HTTP methods from all of the operations
    */
    getAllHttpMethods() {
        let methods = new Set();

        for (let P of Object.keys(this.defn.paths)) {
            Object.keys(this.defn.paths[P]).forEach(item => methods.add(item));
        }
        return Array.from(methods);
    },
    /**
    * Gets all the possible HTTP status codes for an operation
    * @param {string} path - the resource path for this operation
    * @param {string} verb - HTTP verb for this operation
    */
    getStatusCodes(path, verb) {
        let arr = [];
        let ret = [];
        let d,m;
        verb = verb.toLowerCase();

        for (let R of this.defn.split('\n')) {
            if (R.startsWith('#')) {
                continue;
            }
            arr = R.split(',');
            console.dir('ARRR ' + arr);
            if ((arr[1]) && (arr[1] === path) && (arr[2].toLowerCase() === verb)) {
                for (let C of arr[5].split('|')) {
                    console.log('CCCCCC ' + C);
                    d = od.omskepdata.statuscodes.find(x => x.code == C);
                    d = d ? d.reasonphrase : '';
                    m = arr[4] ? arr[4] : '';
                    ret.push({code: C, description: d, media: m});
                }
                return ret;
            }
        }
        return [];
    },
    /**
    * Gets all the paths, sorted by alpha and length
    */
    getPaths() {
        const sf = function(a,b) {return a.localeCompare(b, 'en', {'sensitivity': 'base'});}
        return Object.keys(this.defn.paths).sort(sf);
    },
    /**
    * util function to get the operationId if exists, and generate one if it does not exist
    * @param {string} path - the path segment of the resource
    * @param {string} verb - the HTTP verb for this operation
    */
    getOperationId(path, verb) {

        let arr = [];
        verb = verb.toLowerCase();

        for (let R of this.defn.split('\n')) {
            if (R.startsWith('#')) {
                continue;
            }
            arr = R.split(',');
            if ((arr[1] && arr[1] === path) && (arr[2].toLowerCase() === verb)) {
                return arr[0] ? arr[0] : [];
            }
        }
        return '';
    },

    /**
    * util to check if an operation (verb + path) exists in the definition
    * @param {string} path - the path segment of the resource
    * @param {string} verb - the HTTP verb for this operation
    */
    operationExists(path, verb) {
        let v = verb.toLowerCase();

        for (let R of this.defn.split('\n')) {
            if (R.startsWith('#')) {
                continue;
            }
            arr = R.split(',');
            if ((arr[1] && arr[1] === path) && (arr[2].toLowerCase() === verb)) {
                return true
            }
        }
        return false;
    },
    /**
    * util to check if an path exists in the definition
    * @param {string} path - the path segment of the resource
    */
    pathExists(path) {
        return this.defn.paths[path] ? true : false;
    },
    /**
    * gets the media types for an operation request
    * @param {string} path - the path segment of the resource
    * @param {string} verb - HTTP verb of the operation
    */
    getOperationRequest(path, verb) {
        let ret = [];
        if (! this.operationExists(path, verb)) return [];
        
        if (this.defn.paths[path][verb]['requestBody']['content']) {
            ret = Object.keys(this.defn.paths[path][verb]['requestBody']['content']);
        }

        return ret
    }
}

module.exports = {
    csv: csv
}