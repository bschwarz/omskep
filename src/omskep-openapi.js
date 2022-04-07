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
        let d,m;

        if (defn[path] && defn[path][verb] && defn[path][verb].responses) {
            for (let R of Object.keys(defn[path][verb].responses).sort()) {
                d = defn[path][verb].responses[R].description || '';
                m = defn[path][verb].responses[R].content ? Object.keys(defn[path][verb].responses[R].content) : [];
                ret.push({code: R, description: d, media: m});
            }
        }

        // console.dir(ret)
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

        if (this.operationExists(path, verb) && this.defn.paths[path][v].operationId) {
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
    },
    /**
    * gets the description for an operation
    * @param {string} path - the path segment of the resource
    * @param {string} verb - HTTP verb of the operation
    */
    getOpDescription(path, verb) {
        if (! this.operationExists(path, verb)) return '';

        let d = this.defn.paths[path][verb]['description'] ? this.defn.paths[path][verb]['description'] : '';
        return d.length <= 30 ? d : d.substr(0,29)+'...';
    },
    /**
    * gets base URL for the API. Will get first one if there are multiple servers specified
    */
    getBasePath() {
        return this.defn.servers ? this.defn.servers[0] : {};
    },
    /**
     * generate a list of objects where each object represents a resource
     * and it's methods
     *
     * @return {Array} - array of resources and methods
     * @memberof Openapi
     */
     getOperationSummary() {
        let ret = [];
        for (let P of this.getPaths()) {
            let path = this.defn.paths[P];
            let obj = {};
            let methods = Object.keys(path);
            for (let M of methods) {
                if (this._httpMethods.includes(M)) {
                    obj = {resource: P};
                    obj.method = M;
                    obj.description = path[M].description || '';
                    obj.summary = path[M].summary || '';
                    obj.operationId = path[M].operationId || '';
                    obj.deprecated = path[M].deprecated || false;
                    obj.tags = path[M].tags || [];
                    ret.push(obj);
                }
            }
        }
        return ret;
    },
    /**
    * Retrieves the paths object
    * @returns (String) - returns object containing the path information
    */
     getPath(path) {
        return this.dictKeysExists(this.doc, 'paths', path) ? this.doc.paths[path] : {};
    },
    /**
    * Helper method to see if keys exist in an object
    * A variable number of args are passed in
    * @returns (Boolean) - returns boolean if nested keys exist
    */
     dictKeysExists() {
        let dict = {...arguments[0]};
        for (let i = 1; i < arguments.length; i++) {
            if (typeof dict[arguments[i]] === 'undefined') {
                return false;
            }
            dict = {...dict[arguments[i]]};
        }

        return true;
    }
}

module.exports = {
    openapi3: openapi3
}