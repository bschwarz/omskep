const Openapi = require('@laag/openapi');
const diag = require('./omskep-diagram.js');
const od = require('./omskep-data.js');
const Diagram = diag.Diagram;

/** Class representing plantuml markdowns. */
class Puml extends Diagram {
    /**
    * Ingests the API specification and passes to super class to be used for diagram generation 
    * @param {string} defn - The API specification file (e.g. Swagger) in JSON format
    */
    constructor(defn, filename = null) {
        super(defn, filename);
        this.configs = {mindmap: '', wbs: '', class: '', global: ''};
        this._newStyle = false;
        this._title = false;
        this._showLegend = false;
        this._theme = null;
        this.value = '';
        this.classStart = 'http';
        this.validClassStart = ['http', 'api', 'resource'];
        this.classEnd = 'schema';
        this.validClassEnd = ['resource', 'operation', 'schema'];
        this.classGroupingNumber = 5;
        this._httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head'];
        this.pumlserver = 'www.plantuml.com/plantuml';
        let doctypeMap = {'openapi3': {'file': 'omskep-openapi', 'entry': 'openapi3'},
                          'jsonresume': {'file': '', 'entry': ''},
                          'raml': {'file': 'omskep-raml', 'entry': 'raml'},
                          'cft': {'file': 'omskep-aws', 'entry': 'cft'},
                          'arm': {'arm': 'omskep-arm', 'entry': 'arm'},
                          'k8sservice': {'arm': 'omskep-k8s', 'entry': 'k8s'},
                          'k8sdeploy': {'arm': 'omskep-k8s', 'entry': 'k8s'},
                          'csv': {'arm': 'omskep-csv', 'entry': 'csv'},
        };
        if (!Object.keys(doctypeMap).includes(this.doctype)) {
            console.error(`Error: doctype ${this.doctype} is not recognized as a valid type`)
        }
        const dt = doctypeMap[this.doctype];
        const rest = require(`./${dt.file}.js`);
        Object.assign(Puml.prototype, rest[dt.entry]);
    }
    /**
    * Retrieve the HTTP methods list
    * @returns (Array) - an array of HTTP methods
    */
     get httpMethods() {
        return this._httpMethods;
    }
    /**
    * Sets the httpMethods
    * @param (array) value - array of HTTP methods to use in other methods
    */
    set httpMethods(methods) {
        this._httpMethods = methods;
    }
    /**
    * Getter that gets the config file (!include file)
    */
    get theme() {
        //
        // These are the available themes at puml-themes
        //
        let pumlthemes = ['aws-orange', 'cerulean', 'cerulean-outline', 'materia', 
        'materia-outline', 'cyborg', 'cyborg-outline', 'superhero', 
        'superhero-outline', 'hacker', 'resume-light', 'bluegray', 
        'silver', 'black-knight', 'lightgray', 'metal', 'sketchy-outline',
        'sketchy', 'spacelab', 'minty', 'sandstone', 'united'];
        let ret = '';
        if (!this._theme) return '';
        //
        // Check if the theme exists, and if it does then add the include url
        // for the puml markup
        //
        if (pumlthemes.includes(this._theme)) {
            ret += `!theme ${this._theme}\n\n`;
        } else {
            ret += `!include ${this._theme}\n\n`;
        }
        
        return ret;
    }

    /**
    * Setter that sets the theme to use
    */
    set theme(file) {
        this._theme = file;
    }
    /**
    * Getter that gets the config file (!include file)
    */
    get configfile() {
        return this._configfile;
    }

    /**
    * Setter that sets the config file (!include file)
    */
    set configfile(file) {
        this._configfile = file;
    }

    /**
    * Getter that gets the newStyle configuration
    */
    get newStyle() {
        return this._newStyle;
    }

    /**
    * Setter that sets the newStyle configuration
    */
    set newStyle(bool) {
        this._newStyle = bool;
    }
    /**
    * Getter that gets the boolean value for title
    */
    get title() {
        return this._title;
    }

    /**
    * Setter that sets the boolean value for title
    * @param {boolean} value - The boolean value to assign to the title property
    */
    set title(value) {
        this._title = value;
    }
    /**
    * Getter that gets the boolean value for showLegend
    */
    get showLegend() {
        return this._showLegend;
    }

    /**
    * Setter that sets the boolean value for showLegend
    * @param {boolean} value - The boolean value to assign to the showLegend property
    */
    set showLegend(value) {
        this._showLegend = value;
    }

    /**
    * returns the puml correct success/warning/failure depending on the status code
    * @param {string} status - The HTTP status code
    */
    getStatusFunction(status) {
        return status.charAt(0) === '2' ? '$success("'+status+'")' : (status.charAt(0) === '3' ? '$warning("'+status+'")' : '$failure("'+status+'")');
    }
    /**
    * returns the value of the puml diagram markdown
    */
    puml() {
        return this.value;
    }

    /**
    * This is just to store the plantuml config file to use when and retrieve config
    * @param {string} type - the type of config, either mindmap, wbs or class
    * @param {string} param - (optional) the skinparam to set, it present
    */
    skinparam(type, param = '') {
        if (param === '') {
            let ret = '';
            if (! this.configs[type]) {
                return ret;
            }
            if (this.newStyle) {
                ret += (type === 'global') ? 'skinparam ' : ((type==='mindmap' || type==='wbs') ? '<style>\n '+type+'Diagram' :  'skinparam '+type);
            } else {
                ret += (type === 'global') ? 'skinparam ' : ((type==='mindmap' || type==='wbs') ? 'style '+type+'Diagram' :  'skinparam '+type);
            }
            ret += ' {\n' + this.configs[type] + '\n}\n';
            ret += (type=== 'wbs' || type==='mindmap') ? (this.newStyle ? '</style>\n' : '') : '';
            return ret;
        } else {
            this.configs[type] += param + '\n';

            return;
        }
    }

    /**
    * Determines the title to use, if any
    * @param {string} opid - optional, operationId if diagram might have operationId in title
    */
    getSeqTitle(opid = '') {
        let t1 = `title ${this.title}`;
        let t2 = `title ${this.getTitle()} ${this.getVersion()}`;
        let t3 = '';
        let ret = '';

        if (opid) {
            ret = this.title ?  t1 : (this.title === null ? `title ${opid}` : t3);
        } else {
            ret = this.title ?  t1 : (this.title === null ? t2 : t3);
        }
        
        return this.substVariables(ret, opid);
    }
    /**
    * Generates the mindmap markdown, include start/end tags and any configs
    * @param {boolean} versionSeparate - should the version be in a separate node (true)? Or concatenated with API name (false)?
    */
    mindmap(versionSeparate = false) {
        let indent;
        let ret = '@startmindmap' + '\n';
        const star = "+";

        indent = versionSeparate ? 3 : 2;

        ret += this.theme + '\n\n';
        ret += Puml.httpMethodColors + '\n';
        ret += this.skinparam('global');
        ret += this.skinparam('mindmap');
        if (this.title) {
            ret += `title ${this.defn.info.title} ${this.defn.info.version}\n`;
        }
        if (versionSeparate) {
            ret += star + ' ' + this.defn.info.title + '\n';
            ret += star.repeat(indent-1) + ' ' + this.defn.info.version + '\n';
        } else {
            ret += star + ' ' + this.defn.info.title + '/' + this.defn.info.version + '\n';
        }
        
        ret += this.tree(true, indent) + '\n';
        ret += '@endmindmap';

        this.value = ret;
        return this;
    }

    /**
    * Generates the wbs diagram based on a json resume
    * @param {string} type - either 'wbs' or 'mindmap'
    */
    resumesummary(type = 'wbs') {
        let ret = '@start' + type  + '\n';
        let star = type === 'wbs' ? "*" : "-";
        let resume = this.defn;
        let left = type === 'wbs' ? "<" : "";
        let right = type === 'wbs' ? ">" : "";
        let t1 = `title ${this.title}`;
        let t2 = `title ${this.defn.basics.name}\\n${this.defn.basics.label}`;
        let t3 = '';

        ret += this.theme +'\n\n';
        ret += this.skinparam('global');
        ret += this.skinparam(type);
        
        ret += this.title ?  t1 : (this.title === null ? t2 : t3) + '\n\n';

        ret += star + ' ' + resume.basics.name + '\\n' + resume.basics.label + '\n';
        ret += star.repeat(2) + ' Education' + '\n';
        // EDUCATION
        for (let E of resume.education) {
            ret += star.repeat(3) + ' <b>' + E.area + '\\n' + E.studyType + '\\n' + E.institution + '\n';
        }
        // WORK
        ret += star.repeat(2) + ' Work' + '\n';
        for (let E of resume.work) {
            ret += star.repeat(3) + ' <b>' + E.position + '\\n' + E.company +'\\n' + E.startDate + ' - ' + (E.endDate ? E.endDate : 'present') +'\n';
        }
        star = type === 'wbs' ? '*' : '+';
        // SKILLS
        ret += star.repeat(2) + ' Skills' + '\n';
        let tcnt = 0;
        let cnt = 0;
        for (let E of resume.skills) {
            // ret += star.repeat(3) + ' <b>' + E.name + '\\n' + E.level +'\n';
            // ret += star.repeat(3) + ' <b>' + E.name +'\n';
            ret += star.repeat(3) + (tcnt%2 ? left+' <b>' : right+' <b>') + E.name +'\n';
            tcnt++;
            let cnt = 0;
            for (let K of E.keywords) {
                // ret += star.repeat(4) + ' ' + K +'\n';
                ret += star.repeat(4) + (cnt%2 ? left+' ' : right+' ') + K +'\n';
                cnt++;
            }
        }
        // Also add Languages to Skills
        ret += star.repeat(3) + (tcnt%2 ? left+' <b>' : right+' <b>') + 'Langauges\n';
        for (let L of resume.languages) {
            ret += star.repeat(4) + (cnt%2 ? left+' ' : right+' ') + L.language+'\\n'+L.fluency +'\n';
            cnt++;
        }

        ret += '@end'+type;

        this.value = ret;
        return this;
    }

    /**
    * Generates the deployment diagram based on a CFT file
    */
    azDeployment() {
        this.value = this.getResources().map(x => `node \"${x.id}\\n${x.type}\"`).join('\n');
        return this;
    }
    /**
    * Generates the deployment diagram based on a deploy file
    */
    k8sDeployment() {
        let ret = '@startuml' + '\n';
        let ns = this.getNamespace();

        ret += this.theme +'\n\n';
        ret += '!include <kubernetes/k8s-sprites-labeled-25pct>\n';
        ret += this.skinparam('global');
        //
        // explicitly check for empty string
        // since that will signal the use of title
        // but using the default title instead of a user
        // defined one
        //
        if (this.title === '') {
            ret += `title Deployments for ${ns}\n`;
        }
        ret += `frame "<size:16>${ns}" as ns  {\n`;
        let cnt = 1;
        //
        // Loop through each of the deployments. There might 
        // be multiple deploys in a file.
        //
        for (const deploy of this.getDeployInfo()) {
            let labels = Object.entries(deploy.labels).map(x => (`${x[0]}: ${x[1]}`)).join('\\n<size:10>');
            ret += `rectangle "<$deploy>\\n<size:14>${deploy.name}\\n<size:10>${labels}\\n" as deploy${cnt} {\n`;
            ret += `    node "<$node>" as node${cnt} {\n`;
            let reps = deploy.replicas;
            ret += `        rectangle "<$rs>" as rs${cnt} {\n`;
            for (let i = 1; i <= reps; i++) {
                ret += `        component "<$pod>\\nPod ${i}" as pod${cnt}_${i} {\n`;            
                ret += `            storage "<size:10>port: ${deploy.portnum}" as comp${cnt}_${i}\n`;            
                ret += `        }\n`;            
            }
            ret += '\n    }\n}\n}\n';
            cnt += 1;
        }        
        ret += '}\n@enduml';
        this.value = ret;
        return this;
    }
    
    /**
    * Generates the service diagram based on a deploy file
    */
    k8sService() {
        let poststr = [];
        let prestr = [];
        let ret = '';
        let ns = this.getNamespace();

        ret += this.theme +'\n\n';
        ret += '!include <kubernetes/k8s-sprites-labeled-25pct>\n';
        // ret += 'left to right direction\n';
        ret += 'top to bottom direction\n';
        ret += this.skinparam('global');
        //
        // explicitly check for empty string
        // since that will signal the use of title
        // but using the default title instead of a user
        // defined one
        //
        if (this.title === '') {
            ret += `title Services for ${ns}\n`;
        }
        // ret += 'interface external\n'
        ret += `frame "<size:16>${ns}" as ns  {\n`;
        let cnt = 1;
        // prestr.push(`interface external as int`);
        //
        // Loop through each of the services. There might 
        // be multiple services in a file.
        //
        for (const svc of this.getServiceInfo()) {
            
            let labels = Object.entries(svc.labels).map(x => (`${x[0]}: ${x[1]}`)).join('\\n<size:10>');
            ret += `rectangle "<$svc>\\n<size:14>${svc.name}\\n<size:10>${labels}\\n" as svc${cnt} {\n`;
            ret += `    card "port: ${svc.ports[0].port || 'undefined'}" as card${cnt}_1\n`;
            ret += `    card "nodePort: ${svc.ports[0].nodePort || 'undefined'}" as card${cnt}_2\n`;
            ret += ` }\n`;
            ret += `    node "<$node>" as node${cnt} {\n`;
            // ret += `        rectangle "<$rs>" as rs${cnt} {\n`;
            // ret += `            component "<$pod>\\nPod" as pod${cnt} {\n`;            
            // ret += `                storage "<size:10>port: ${svc.ports[0].targetPort || ''}" as comp${cnt}\n`;            
            // ret += `            }\n`;            
            ret += '\n    \n}\n';
            // prestr.push(`interface external as int${cnt}`);
            // poststr.push(`int${cnt} -- svc${cnt} : <size:10>nodePort\\n<size:10>${svc.ports[0].nodePort || ''}`);
            poststr.push(`node${cnt} -- svc${cnt} : <size:10>port\\n<size:10>${svc.ports[0].port || ''}`);
            cnt += 1;
        }
        
        // ret += '}\n@enduml';
        this.value = `@startuml\n${prestr.join('\n')}\n${ret}\n${poststr.join('\n')}\n}\n@enduml`;
        return this;
    }
    /**
    * Generates the wbs markdown, include start/end tags and any configs
    * @param {boolean} versionSeparate - should the version be in a separate node (true)? Or concatenated with API name (false)?
    */
    wbs(versionSeparate = false) {
        let indent;
        let ret = '@startwbs' + '\n';
        const star = "+";

        indent = versionSeparate ? 3 : 2;

        ret += this.theme + '\n\n';
        ret += this.skinparam('global');
        ret += this.skinparam('wbs');
        if (this.title) {
            ret += `title ${this.defn.info.title} ${this.defn.info.version}\n`;
        }
        if (versionSeparate) {
            ret += star + ' ' + this.defn.info.title + '\n';
            ret += star.repeat(indent-1) + ' ' + this.defn.info.version + '\n';
        } else {
            ret += star + ' ' + this.defn.info.title + '/' + this.defn.info.version + '\n';
        }
        ret += this.tree(false, indent) + '\n';
        ret += '@endwbs';

        this.value = ret;
        return this;
    }

    /**
    * Generates the class markdown, include start/end tags and any configs
    * @param {string} level - what level to display in the tree (all, operation, resource)
    */
    class(resource=null) {
        let classData = this.classItems(resource);
        let ret = '@startuml' + '\n';
        let resourceSchemaMap = {};

        ret += this.theme + '\n\n';
        ret += Puml.httpMethodColors + '\n';
        ret += 'hide empty members\n';
        ret += this.skinparam('global');
        ret += this.skinparam('class');
        ret += 'skinparam packageStyle rectangle\n';
        ret += 'skinparam packageStyle rectangle\n';
        ret += 'skinparam defaultFontName        "Verdana"\n';
        ret += 'skinparam defaultFontSize        12\n';
        ret += 'skinparam dpi                    100\n';
        ret += 'skinparam shadowing              false\n';
        ret += 'skinparam roundcorner            15\n';
        ret += 'skinparam Padding                1\n';
        ret += 'skinparam class {\nBorderColor #cccccc\n}\n';

        if (this.title) {
            ret += `title ${this.getTitle()} ${this.getVersion()}\n`;
        }

        if (this.classStart === 'http' && ! resource) {
            ret += 'interface " HTTP/1.1" as HTTP {\n';
            ret += Puml.httpMethods.map(x => `+ <i> ${x.toUpperCase()} ()</i>`).join('\n') + '\n}\n';
        }
        if ((this.classStart === 'http' || this.classStart === 'api') && ! resource) {
            ret += `interface " ${this.getTitle()} ${this.getVersion()}" as _api_  << (A, orange) >> {\n`;
            ret += this.getAllHttpMethods().map(x => `+ <i> ${x.toUpperCase()} ()</i>`).join('\n') + '\n}\n';
        }
        for (let C of classData.classes) {
            //
            // Generate the resource level entities
            //
            if (resource === null || C.name.resource === resource) {
                // console.log(C.methods);
                resourceSchemaMap[C.name.resource] = [];
                ret += `class " ${C.name.resource}" as ${C.name.alias} << (R, orange) >> {\n`;
                for (let RM of C.methods) {
                    let op = `${RM.toUpperCase()} ()`;
                    if (this.isOperationDeprecated(C.name.resource, RM)) {
                        op = `-- ${RM.toUpperCase()} ()--`;
                    }
                    ret += `+ <i> ${op}</i>\n`;
                }
                ret += '\n}\n';
                if (this.classEnd === 'schema' || this.classEnd === 'operation') {
                    for (let M of C.methods) {
                        //
                        // Generate the operation level entities
                        //
                        let m = M.toLowerCase();
                        let title = `${M.toUpperCase()} ${C.name.resource}`;
                        if (this.isOperationDeprecated(C.name.resource, m)) {
                            title = `--${M.toUpperCase()} ${C.name.resource}--`;
                        }
                        ret += `class " ${title}" as ${M}-${C.name.alias} {\n`;
                        ret += `==request params==\n`;
                        for (let P of this.getOperationParameters(C.name.resource, m, 'all')) {
                            ret += `+ ${P.name} [${P.location}]\n`;
                        }
                        ret += `==request body==\n`;
                        let media = this.getOperationRequestMedia(C.name.resource, m);
                        let resp = this.getOperationRequest(C.name.resource, m);
                        if (media.length) {
                            if (resp.content[media[0]].schema['$ref']) {
                                let schema = resp.content[media[0]].schema['$ref'].split('/');
                                let sname = schema[schema.length - 1];
                                ret += `${sname}\n`;
                                if (this.classEnd === 'schema') {
                                    classData.paths.push(`"${M}-${C.name.alias}" o-- "${sname}"`);
                                }
                            } else {
                                if (resp.content[media[0]].schema['type'] && resp.content[media[0]].schema['type'] === 'array') {
                                    if (resp.content[media[0]].schema['items']['$ref']) {
                                        let schema = resp.content[media[0]].schema['items']['$ref'].split('/');
                                        let sname = schema[schema.length - 1];
                                        ret += `[ ${sname} ]\n`;
                                        if (this.classEnd === 'schema') {
                                            classData.paths.push(`"${M}-${C.name.alias}" o-- "${sname}"`);
                                            resourceSchemaMap[C.name.resource].push(sname);
                                        }
                                    } else {
                                        ret += `<i> inline schema</i>\n`;
                                    }
                                } else if (resp.content[media[0]].schema.allOf) {
                                    let label = '';
                                    // ret += `${S.code} `;
                                    for (let AS of resp.content[media[0]].schema.allOf) {
                                        let schema = AS['$ref'].split('/');
                                        let sname = schema[schema.length - 1];
                                        ret += `${label} ${sname}\n`;
                                        if (this.classEnd === 'schema') {
                                            classData.paths.push(`"${M}-${C.name.alias}" o-- "${sname}"`);
                                            resourceSchemaMap[C.name.resource].push(sname);
                                        }
                                        label = '.....:';
                                    }
                                    // ret += '\n';
                                } else {
                                    ret += `\n`;
                                }
                            }
                        } else {
                            ret += `\n`;
                        }
                        ret += `==responses==\n`;
                        for (let S of this.getStatusCodes(C.name.resource, m)) {
                            media = this.getOperationResponseMedia(C.name.resource, m, S.code);
                            resp = this.getOperationResponse(C.name.resource, m, S.code);
                            if (media.length) {
                                if (resp.content[media[0]].schema['$ref']) {
                                    let schema = resp.content[media[0]].schema['$ref'].split('/');
                                    let sname = schema[schema.length - 1];
                                    ret += `${S.code}: ${sname}\n`;
                                    if (this.classEnd === 'schema') {
                                        classData.paths.push(`"${M}-${C.name.alias}" o-- "${sname}"`);
                                    }
                                } else {
                                    if (resp.content[media[0]].schema['type'] && resp.content[media[0]].schema['type'] === 'array') {
                                        if (resp.content[media[0]].schema['items']['$ref']) {
                                            let schema = resp.content[media[0]].schema['items']['$ref'].split('/');
                                            let sname = schema[schema.length - 1];
                                            ret += `${S.code}: [ ${sname} ]\n`;
                                            if (this.classEnd === 'schema') {
                                                classData.paths.push(`"${M}-${C.name.alias}" o-- "${sname}"`);
                                                resourceSchemaMap[C.name.resource].push(sname);
                                            }
                                        } else {
                                            ret += `${S.code}: <i> inline schema</i>\n`;
                                        }
                                    } else if (resp.content[media[0]].schema.allOf) {
                                        let label = S.code + ':';
                                        // ret += `${S.code} `;
                                        for (let AS of resp.content[media[0]].schema.allOf) {
                                            let schema = AS['$ref'].split('/');
                                            let sname = schema[schema.length - 1];
                                            ret += `${label} ${sname}\n`;
                                            if (this.classEnd === 'schema') {
                                                classData.paths.push(`"${M}-${C.name.alias}" o-- "${sname}"`);
                                                resourceSchemaMap[C.name.resource].push(sname);
                                            }
                                            label = '.....:';
                                        }
                                        // ret += '\n';
                                    } else {
                                        ret += `${S.code}: --\n`;
                                    }
                                }
                            } else {
                                ret += `${S.code}: --\n`;
                            }
                        }
                        ret += '}\n';
                        classData.paths.push(`"${C.name.alias}" o-- "${M}-${C.name.alias}"`);
                    }
                }
            }
        }
        if (this.classEnd === 'schema') {
            for (let S of Object.keys(this.getComponentsSchemas())) {
                if (! resource || (resourceSchemaMap[resource] && resourceSchemaMap[resource].includes(S))) {

                    ret += `class " ${S}" as ${S} << (S, red) >>{\n`;
                    ret += '}\n';
                }
            }
        }
        if (this.classStart === 'http' && ! resource) {
            ret += 'HTTP o-- _api_\n';
        }
        ret += classData.paths.map(x => x).join('\n');
        ret += '\n@enduml';

        this.value = ret;
        return this;
    }

    /**
    *This generates the class data used to generate the markdown for class diagrams
    */
    classItems(resource=null) {
        let paths = [];
        let pstr = '/';
        let cnt = 2;
        let ret = {classes: [], paths: []};
        let prev = '_api_';
        let given_paths = this.getPaths(this.defn.paths);
        let arrow = '-';

        //
        // Loop over paths in the swagger file, assuming the paths
        // were sorted from the getPaths function
        //
        let div = Math.ceil(given_paths.length / this.classGroupingNumber) + 1;
        for (let P of given_paths) {
            if (resource === null || P === resource) {

                let offset = cnt / div;
                let obj = {};
                let alias = P.replace(/\{|\}/g, '_');
                obj.name = {resource: P, alias: alias};
                obj.methods = Object.keys(this.defn.paths[P]).filter(x => Puml.httpMethods.includes(x));
                ret.classes.push(obj);
                if (! resource) {
                    ret.paths.push(`"${prev}" o${arrow.repeat(cnt)} "${alias}"`);
                }
                cnt = (cnt >= div) ? 2 : (cnt + 1);
            }
        }

        return ret;
    }

   /**
    * This generates sequence markdown for a sequence diagram for an operation
    * @param {object} params - an object that contains the names of the elements in the sequence diagram {verb: '', url: '', client: '', gw: '', server: '', automumber: false}
    */
    sequence(params) {
        params.resource = params.resource.replace('//', '/');
        let ret = '@startuml\n';
        let statuses = this.getStatusCodes(params.resource, params.verb);
        let opid = this.getOperationId(params.resource, params.verb);
        let code, description, media;
        let icons = '';
        if (! this.operationExists(params.resource, params.verb)) {
            // throw new Error('Operation does not exist in definition file');
            // TODO: might change this to throw an error instead of returning empty
            this.value = '';
            return this;
        }

        ret += this.theme +'\n\n';
        ret += Puml.httpMethodColors + '\n';
        ret += Puml.statusFunctions + '\n';
        ret += this.skinparam('global');
        ret += this.skinparam('sequence');
        
        if (this.showLegend) {
            ret += '\nlegend\n';
            //let sum = this.defn.paths[params.url][params.verb].summary || '';
            let sum = '';
            if (sum) {
                ret += `<b>${sum}\n\n`;
            }
            ret += '|= HTTP Status |= Reason Phrase |\n';
            ret += statuses.map(x => x.code).sort().map(x => `| ${this.getStatusFunction(x)} | ${od.omskepdata.statuscodes.find(y => y.code === x).reasonphrase} |`).join('\n');
            ret += '\nendlegend\n\n'
        }
        ret += this.getSeqTitle(opid) + '\n\n';

        params.client = (!params.client) ? 'Client' : params.client;
        params.gw = (!params.gw) ? 'API GW' : params.gw;
        // params.autonumber = (!params.autonumber) ? false : params.gw;
        icons = params.icons ? '<size:32><&monitor>\\n' : '';
        ret += `participant "${icons}${params.client}" as C\n`;
        icons = params.icons ? '<size:32><&cloud>\\n' : '';
        ret += `participant "${icons}${params.gw}" as G\n`;
        
        if (params.server) {
            params.server = this.substVariables(params.server);
            icons = params.icons ? '<size:32><&hard-drive>\\n' : '';
            ret += `participant "${icons}${params.server}" as B\n`;
        }

        ret += `C->G: ${params.verb.toUpperCase()} [[${this.getBasePath().url}${params.resource}{${this.getOpDescription(params.resource, params.verb)}} ${params.resource}]]\n`;
        ret += 'activate G\n';
        if (params.server) {
            ret += `G->B: request to API service\n`;
            ret += `B-->G: response from API service\n`;
        }

        ret += 'alt ';
        for (let S of statuses) {
            ({code, description, media} = S);
            // ret += this.defn.paths[params.url][params.verb].responses[S].description || (S.charAt(0) === '2' ? 'Successful Request' : 'UnSuccessful Request');
            // ret += this.defn.paths[params.path][params.verb].responses[S].description + '\n';
            ret += description + '\n';
            ret += 'G-->C: HTTP ';
            ret += this.getStatusFunction(code) + '\\n<i><size:9>' + (typeof media === 'object' ? media.join(' || ') : media);
            ret += '\nelse ';
        }
        

        ret += '\ndeactivate G\n';
        ret += 'end\n';
        ret += '@enduml';
        
        this.value = ret;
        return this;
    }

    /**
    * This generates the URL to feed to plantuml server
    * @param {string} imgfmt - the imgfmt to use, either png or svg
    * @param {string} value - the encoded string of the diagram
    */
    pumlurl(imgfmt, value = '') {
        if (value === '') {
            value = this.value;
        }
        let pumlEncoder = require('plantuml-encoder');

        return `https://${this.pumlserver}/${imgfmt}/${pumlEncoder.encode(value)}`;
    }

    /**
    * This generates the tree markdown for both the mindmap and wbs diagrams. It only generates the tree part, not any of the other markdown
    * @param {boolean} onesided - If true, then diagram will only be drawn on one side. If false then will alternate left and right side
    * @param {integer} indent - the level of indent of the tree to start with. Defaults to 3 assuming there will be a API name and version as part of tree
    */
    tree(onesided, indent = 3) {
        let paths = [];
        let rstar = "+", lstar = "-", star = "*";
        let str = '', pstr = '/';
        let cnt = 0;
        let given_paths = this.getPaths();

        if (onesided) {
            lstar = rstar = star;
        }
        //
        // Loop over paths in the swagger file, assuming the paths
        // were sorted from the getPaths function
        //
        for (let P of given_paths) {

            // console.log(P);
            star = cnt%2 ? lstar : rstar; // alternate left and right side if set to true

            cnt++;
            pstr = '/';
            let segs = P.replace(/^\/+|\/+$/g, '').split(/[\/]/); // removes begin and end slashes and then splits
            //
            // loop over each path segment, since puml needs every
            // path segment accounted for in the tree
            //
            for (let S = 0; S < segs.length; S++) {
                pstr += segs[S]+'/';
                        // console.log('SEG: ' + pstr);

                //
                // If the path was already processed, or if it's already
                // in the paths from the swagger file, then do not process
                // since it was either already processed, or will be 
                // processed
                //
                if (paths.includes(pstr) || given_paths.includes(pstr) ) {
                    continue;
                }
                paths.push(pstr);

                str += star.repeat(S+indent) + ' ' + segs[S] + '\n';
                //
                // If this is the last path segment, then we get
                // the HTTP methods assigned to this path
                //
                if (S === segs.length-1) {
                    // str += "_";
                    for (let M of Object.keys(this.defn.paths[P])) {
                        str += star.repeat(S+indent+1) + '_ ' + M.toUpperCase() + '\n';
                    }
                }
            }
        }
        return str;
    }

    /**
    * Substitutes variables with values from the input file
    * @param {string} str - string that needs variables replaced
    * @param {string} opid - optional, the operationId in case operationId needs substitution
    */
    substVariables(str, opid = '') {
        let map = {};
        map['%apiname%'] = this.getTitle();
        map['%title%'] = this.getTitle();
        map['%version%'] = this.getVersion();
        if (opid != '') {
            map['%operationid%'] = opid;
        }
        let re = new RegExp(Object.keys(map).join("|"),"gi");

        return str.replace(re, (matched) => {
            return map[matched.toLowerCase()];
        });
    }
    /**
    * Getter that returns the avaiable HTTP methods
    */
    static get httpMethods() {
        return od.omskepdata.httpMethodColors.map(x => x.name);
    }
}

/**
* Holds the colors associated with the HTTP methods (verbs) 
*/
Puml.httpMethodColors = od.omskepdata.httpMethodColors.map(x => `!${x.heading} = "<color ${x.color}>${x.heading}</color>"`).join('\n');

/**
* Holds all of the puml functions for success, warning and failure cases
*/
Puml.statusFunctions = `!if %not(%function_exists("$success"))\n!function $success($msg)\n<font color=green><b>$msg\n!endfunction\n!endif\n!if %not(%function_exists("$failure"))\n!function $failure($msg)\n<font color=red><b>$msg\n!endfunction\n!endif\n!if %not(%function_exists("$warning"))\n!function $warning($msg)\n<font color=orange><b>$msg\n!endfunction\n!endif`;


module.exports = {
    Puml: Puml
}
