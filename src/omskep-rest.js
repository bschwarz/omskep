//
// This file contains both the Swagger/OpenAPI and RAML methods that get mixed in
// to the classes
//

let openapi3 = {
   
    /**
    * Retrieves the title for the API from the openapi3 document
    */
    getTitle() {
        return this.defn.info.title;
    },
    /**
    * Retrieves the version for the API from the openapi3 document
    */
    getVersion() {
        return this.defn.info.version;
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
        let defn = this.defn.paths;
        let ret = [];

        if (defn[path] && defn[path][verb] && defn[path][verb].responses) {
            for (let R of Object.keys(defn[path][verb].responses).sort()) {
                const d = defn[path][verb].responses.description || '';
                ret.push({code: R, description: d});
            }
        }
        return ret;
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

        let v = verb.toLowerCase();

        if (this.defn.paths[path] && this.defn.paths[path][v].operationId) {
            return this.defn.paths[path][v].operationId;
        }

        let str = path.replace('/', '').split('/').pop().replace(/{([^}]*)}/g, '$1');
        
        return v + str.charAt(0).toUpperCase() + str.substr(1);
    },

    /**
    * util to check if an operation (verb + path) exists in the definition
    * @param {string} path - the path segment of the resource
    * @param {string} verb - the HTTP verb for this operation
    */
    operationExists(path, verb) {
        let v = verb.toLowerCase();

        return (this.defn.paths[path] && this.defn.paths[path][v]) ? true : false;
    },
    /**
    * util to check if an path exists in the definition
    * @param {string} path - the path segment of the resource
    */
    pathExists(path) {

        return this.defn.paths[path] ? true : false;
    }
}

let raml = {
   
    /**
    * Retrieves the title for the API from the openapi3 document
    */
    getTitle() {
        return this.defn.title || '';
    },
    /**
    * Retrieves the version for the API from the openapi3 document
    */
    getVersion() {
        return this.defn.version || '';
    },
   /**
    * Gets all the possible HTTP methods from all of the operations
    */
    getAllHttpMethods() {
        let methods = new Set();

        for (let P of Object.keys(this.defn)) {
            if (P.charAt(0) != '/') continue;
            Object.keys(this.defn[P]).forEach(item => methods.add(item));
        }
        return Array.from(methods);
    },
    /**
    * Gets all the possible HTTP status codes for an operation
    * @param {string} path - the resource path for this operation
    * @param {string} verb - HTTP verb for this operation
    */
    getStatusCodes(path, verb) {
        let defn = this.defn;
        let ret = [];

        if (defn[path] && defn[path][verb] && defn[path][verb].responses) {
            for (let R of Object.keys(defn[path][verb].responses).sort()) {
                const d = defn[path][verb].responses.description || '';
                ret.push({code: R, description: d});
            }
        }
        return ret;
    },
    /**
    * Gets all the paths, sorted by alpha and length
    */
    getPaths() {
        const sf = function(a,b) {return a.localeCompare(b, 'en', {'sensitivity': 'base'});}
        return Object.keys(this.defn).sort(sf);
    },
    /**
    * util function to get the operationId if exists, and generate one if it does not exist
    * @param {string} path - the path segment of the resource
    * @param {string} verb - the HTTP verb for this operation
    */
    getOperationId(path, verb) {

        let v = verb.toLowerCase();

        if (this.defn[path][v].operationId) {
            return this.defn[path][v].operationId;
        }

        let str = path.replace('/', '').split('/').pop().replace(/{([^}]*)}/g, '$1');
        
        return v + str.charAt(0).toUpperCase() + str.substr(1);
    },
    /**
    * util to check if an operation (verb + path) exists in the definition
    * @param {string} path - the path segment of the resource
    * @param {string} verb - the HTTP verb for this operation
    */
    operationExists(path, verb) {
        let v = verb.toLowerCase();

        // TODO: might have to normalize the path because they can be nested
        return (this.defn[path] && this.defn.paths[path][v]) ? true : false;
    },
    /**
    * util to check if an path exists in the definition
    * @param {string} path - the path segment of the resource
    */
    pathExists(path) {

        // TODO: might need to normalize this because paths can be nested
        return this.defn[path] ? true : false;
    }
}


module.exports = {
    openapi3: openapi3,
    raml: raml
}