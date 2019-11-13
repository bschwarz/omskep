/** Class representing a generial diagram, used as base for other subclasses. */
class Diagram {

    /**
    * Ingests the API specification for use with other subclasses 
    * @param {string} defn - The API specification file (e.g. Swagger) in JSON format
    */
    constructor(defn) {
        this.defn = JSON.parse(defn);
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

/** Static variable to hold the statuscodes */
Diagram.statuscodes = [
    {code: '200', reasonphrase: 'OK'},
    {code: '201', reasonphrase: 'Created'},
    {code: '202', reasonphrase: 'Accepted'},
    {code: '204', reasonphrase: 'No Content'},
	{code: '300', reasonphrase: 'Multiple Choices'},
	{code: '301', reasonphrase: 'Moved Permanently'},
	{code: '302', reasonphrase: 'Found'},
	{code: '303', reasonphrase: 'See Other'},
	{code: '304', reasonphrase: 'Not Modified'},
	{code: '305', reasonphrase: 'Use Proxy'},
	{code: '307', reasonphrase: 'Temporary Redirect '},
	{code: '308', reasonphrase: 'Permanent Redirect '},
	{code: '400', reasonphrase: 'Bad Request'},
	{code: '401', reasonphrase: 'Unauthorized'},
	{code: '403', reasonphrase: 'Forbidden'},
	{code: '404', reasonphrase: 'Not Found'},
	{code: '405', reasonphrase: 'Method Not Allowed'},
	{code: '406', reasonphrase: 'Not Acceptable'},
	{code: '408', reasonphrase: 'Request Timeout'},
	{code: '409', reasonphrase: 'Conflict'},
	{code: '410', reasonphrase: 'Gone'},
	{code: '411', reasonphrase: 'Length Required'},
	{code: '412', reasonphrase: 'Precondition Failed'},
	{code: '413', reasonphrase: 'Payload Too Large'},
	{code: '414', reasonphrase: 'URI Too Long'},
	{code: '415', reasonphrase: 'Unsupported Media Type'},
	{code: '416', reasonphrase: 'Range Not Satisfiable'},
	{code: '417', reasonphrase: 'Expectation Failed'},
	{code: '426', reasonphrase: 'Upgrade Required'},
	{code: '428', reasonphrase: 'Precondition Required'},
	{code: '429', reasonphrase: 'Too Many Requests'},
	{code: '431', reasonphrase: 'Request Header Fields Too Large'},
	{code: '500', reasonphrase: 'Internal Server Error'},
	{code: '501', reasonphrase: 'Not Implemented'},
	{code: '502', reasonphrase: 'Bad Gateway'},
	{code: '503', reasonphrase: 'Service Unavailable'},
	{code: '504', reasonphrase: 'Gateway Timeout'}
];
/** Static variable to hold the HTTP method colors */
Diagram.httpMethodColors = [
    {name: 'get', color: '#009fdb', heading: 'GET'},
    {name: 'post', color: '#007a3e', heading: 'POST'},
    {name: 'put', color: '#ea7400', heading: 'PUT'},
    {name: 'delete', color: '#cf2a2a', heading: 'DELETE'},
    {name: 'patch', color: '#b5bd00', heading: 'PATCH'},
    {name: 'head', color: '#9012fe', heading: 'HEAD'},
    {name: 'options', color: '#0d5aa7', heading: 'OPTIONS'}
];


module.exports = {
    Diagram: Diagram
}