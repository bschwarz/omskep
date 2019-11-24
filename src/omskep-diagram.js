/** Class representing a generial diagram, used as base for other subclasses. */
class Diagram {

    /**
    * Ingests the API specification for use with other subclasses 
    * @param {string} defn - The API specification file (e.g. Swagger) in JSON format
    */
    constructor(defn, filename = null) {
        this.filename = filename ? filename.replace(/^.*[\\\/]/, '') : '';
        try {
            this.defn = JSON.parse(defn);
        } catch(e) {
            let line = defn.split('\n').shift();
            console.log(line);
            if (line.split(',').length > 2) {
                this.defn = defn;
                this.doctype = 'csv';
                return;
            }
            console.error(e);
            return;
        }
        if (this.defn.openapi) {
            const ver = this.defn.openapi.split('.').shift();
            if (ver === '3') {
                this.doctype = 'openapi3';
                this.docversion = this.defn.openapi;
            }
        } else if (this.defn.basics && this.defn.basics.label && this.defn.work) {
            this.doctype = 'jsonresume';
        } else if (this.defn.title && Object.keys(this.defn).filter(x => x.charAt(0) === '/')) {
            this.doctype = 'raml';
        } else if (this.defn.AWSTemplateFormatVersion) {
            this.doctype = 'cft';
        } else if (this.defn['$schema'] && this.defn['$schema'].match('azure')) {
            this.doctype = 'arm';
        }
        
    }

    /**
    * Getter that returns the avaiable HTTP methods
    */
    static get httpMethods() {
        return Diagram.httpMethodColors.map(x => x.name);
    }

    /**
    * Returns a random key to be used as a unique ID
    */
    randomKey() {
        return Date.now()*1000 + Math.floor((Math.random() * 1000) + 1);
    }



    // /**
    // * Gets all the possible HTTP methods from all of the operations
    // */
    // getAllHttpMethods() {
    //     let methods = new Set();

    //     for (let P of Object.keys(this.defn.paths)) {
    //         Object.keys(this.defn.paths[P]).forEach(item => methods.add(item));
    //     }
    //     return Array.from(methods);
    // }

    // /**
    // * Gets all the possible HTTP status codes for an operation
    // * @param {string} path - the resource path for this operation
    // * @param {string} verb - HTTP verb for this operation
    // */
    // getStatusCodes(path, verb) {
    //     return Object.keys(this.defn.paths[path][verb].responses).sort();
    // }

    // /**
    // * Gets all the paths, sorted by alpha and length
    // */
    // getPaths() {
    //     const sf = function(a,b) {return a.localeCompare(b, 'en', {'sensitivity': 'base'});}
    //     return Object.keys(this.defn.paths).sort(sf);
    // }

    // /**
    // * util function to get the operationId if exists, and generate one if it does not exist
    // * @param {string} path - the path segment of the resource
    // * @param {string} verb - the HTTP verb for this operation
    // */
    // getOperationId(path, verb) {

    //     let v = verb.toLowerCase();

    //     if (this.defn.paths[path][v].operationId) {
    //         return this.defn.paths[path][v].operationId;
    //     }

    //     let str = path.replace('/', '').split('/').pop().replace(/{([^}]*)}/g, '$1');
        
    //     return v + str.charAt(0).toUpperCase() + str.substr(1);
    // }
}


module.exports = {
    Diagram: Diagram
}