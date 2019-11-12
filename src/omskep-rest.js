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
        return Object.keys(this.defn.paths[path][verb].responses).sort();
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

        if (this.defn.paths[path][v].operationId) {
            return this.defn.paths[path][v].operationId;
        }

        let str = path.replace('/', '').split('/').pop().replace(/{([^}]*)}/g, '$1');
        
        return v + str.charAt(0).toUpperCase() + str.substr(1);
    }
}

module.exports = {
    openapi3: openapi3
}