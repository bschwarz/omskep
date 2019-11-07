const diag = require('./omskep-diagram.js');
const Diagram = diag.Diagram;

/** Class representing plantuml markdowns. */
class Puml extends Diagram {
    /**
    * Ingests the API specification and passes to super class to be used for diagram generation 
    * @param {string} defn - The API specification file (e.g. Swagger) in JSON format
    */
    constructor(defn) {
        super(defn);
        this.configs = {mindmap: '', wbs: '', class: '', global: ''};
        this._configfile = '';
        this._newStyle = false;
        this._showTitle = false;
        this._showLegend = false;
        this.value = '';
    }
    /**
    * Getter that gets the config file (!include file)
    */
    get configFile() {
        return this._configfile;
    }

    /**
    * Setter that sets the config file (!include file)
    */
    set configFile(file) {
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
    * Getter that gets the boolean value for showTitle
    */
    get showTitle() {
        return this._showTitle;
    }

    /**
    * Setter that sets the boolean value for showTitle
    * @param {boolean} value - The boolean value to assign to the showTitle property
    */
    set showTitle(value) {
        this._showTitle = value;
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
    // /**
    // * Getter that returns the colors associated with the HTTP methods (verbs) 
    // */
    // static get httpMethodColors() {
    //     return Diagram.httpMethodColors.map(x => `!${x.heading} = "<color ${x.color}>${x.heading}</color>"`).join('\n');
    // }
    // /**
    // * Getter that returns the puml functions for success, warning and failure cases
    // */
    // static get statusFunctions() {
    //         return `!if %not(%function_exists("$success"))\n!function $success($msg)\n<font color=green><b>$msg\n!endfunction\n!endif\n!if %not(%function_exists("$failure"))\n!function $failure($msg)\n<font color=red><b>$msg\n!endfunction\n!endif\n!if %not(%function_exists("$warning"))\n!function $warning($msg)\n<font color=orange><b>$msg\n!endfunction\n!endif`;
    // }

    /**
    * returns the puml correct success/warning/failure depending on the status code
    * @param {string} status - The HTTP status code
    */
    getStatusFunction(status) {
        return status.charAt(0) === '2' ? '$success('+status+')' : (status.charAt(0) === '3' ? '$warning('+status+')' : '$failure('+status+')');
    }


    /**
    * This is just to store the plantuml config file to use when and retrieve config
    * @param {string} type - the type of config, either mindmap, wbs or class
    * @param {string} param - (optional) the skinparam to set, it present
    */
    skinparam(type, param = '') {
        if (param === '') {
            let ret = '';
            if (this.newStyle) {
                ret += (type === 'global') ? 'skinparam ' : ((type==='mindmap' || type==='wbs') ? '<style>\n '+type+'Diagram' :  'skinparam '+type);
            } else {
                ret += (type === 'global') ? 'skinparam ' : ((type==='mindmap' || type==='wbs') ? 'style '+type+'Diagram' :  'skinparam '+type);
            }
            ret += ' {\n' + (this.configs[type] ? this.configs[type] : '' );
            ret += '\n}\n';
            ret += (type=== 'wbs' || type==='mindmap') ? (this.newStyle ? '</style>\n' : '') : '';

            return ret;
        } else {
            this.configs[type] += param + '\n';

            return;
        }
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

        if (this.configFile != '') {
            ret += '!include ' + this.configFile + '\n';
        }
        ret += Puml.httpMethodColors + '\n';
        ret += this.skinparam('global');
        ret += this.skinparam('mindmap');
        if (this.showTitle) {
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
        return ret;
    }

    /**
    * Generates the wbs markdown, include start/end tags and any configs
    * @param {boolean} versionSeparate - should the version be in a separate node (true)? Or concatenated with API name (false)?
    */
    wbs(versionSeparate = false) {
        let indent = 3;
        let ret = '@startwbs' + '\n';
        const star = "+";

        indent = versionSeparate ? 3 : 2;

        if (this.configFile != '') {
            ret += '!include ' + this.configFile + '\n';
        }
        ret += this.skinparam('global');
        ret += this.skinparam('wbs');
        if (this.showTitle) {
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
        return ret;
    }

    /**
    * Generates the class markdown, include start/end tags and any configs
    */
    class() {
        let classData = this.classItems();
        let ret = '@startuml' + '\n';
        if (this.configFile != '') {
            ret += '!include ' + this.configFile + '\n';
        }
        ret += Puml.httpMethodColors + '\n';
        ret += 'hide empty members\n';
        ret += this.skinparam('global');
        ret += this.skinparam('class');
        if (this.showTitle) {
            ret += `title ${this.defn.info.title} ${this.defn.info.version}\n`;
        }

        ret += 'interface "HTTP/1.1" as HTTP {\n';
        ret += Diagram.httpMethods.map(x => `+ <i> ${x.toUpperCase()} ()</i>`).join('\n') + '\n}\n';
        ret += 'interface "' + this.defn.info.title + '/' + this.defn.info.version + '" as _api_ << (A, orange) >> {\n';
        ret += this.getAllHttpMethods().map(x => `+ <i> ${x.toUpperCase()} ()</i>`).join('\n') + '\n}\n';

        for (let C of classData.classes) {
            ret += 'class "' + C.name.resource + '" as ' + C.name.rpath + ' << (R, orange) >> {\n';
            ret += C.methods.map(x => `+ <i> ${x.toUpperCase()} ()</i>`).join('\n') + '\n}\n';
        }

        ret += 'HTTP o-- _api_\n';
        ret += classData.paths.map(x => x).join('\n');
        ret += '\n@enduml';

        this.value = ret;
        return ret;
    }

    /**
    *This generates the class data used to generate the markdown for class diagrams
    */
    classItems() {
        let paths = [];
        let pstr = '/';
        let cnt = 0;
        let ret = {classes: [], paths: []};
        let prev = 'api';
        let given_paths = d.getPaths(d.defn.paths);

        //
        // Loop over paths in the swagger file, assuming the paths
        // were sorted from the getPaths function
        //
        for (let P of given_paths) {

            cnt++;
            pstr = '/';
            prev = '_api_';
            let segs = P.replace(/^\/+|\/+$/g, '').split(/[\/]/); // removes begin and end slashes and then splits
            //
            // loop over each path segment, since puml needs every
            // path segment accounted for in the tree
            //
            for (let S = 0; S < segs.length; S++) {
                let obj = {};
                pstr += segs[S].replace(/\{|\}/g, '_')+'/';
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

                obj.name = {resource: segs[S], rpath: pstr};
                obj.methods = [];
                if (prev === '_api_') {
                    ret.paths.push('"' + prev + '" o-- "' + pstr + '"');
                } else {
                    ret.paths.push('"' + prev + '" <-- "' + pstr + '"');
                }
                
                prev = pstr;
                //
                // If this is the last path segment, then we get
                // the HTTP methods assigned to this path
                //
                if (S === segs.length-1) {
                    // str += "_";
                    obj.methods = Object.keys(d.defn.paths[P]);
                }

                ret.classes.push(obj);
            }
            
        }

        return ret;
    }

   /**
    * This generates sequence markdown for a sequence diagram for an operation
    * @param {object} params - an object that contains the names of the elements in the sequence diagram {verb: '', url: '', client: '', gw: '', server: '', automumber: false}
    */
    sequence(params) {
        let ret = '@startuml\n';
        let statuses = this.getStatusCodes(params.path, params.verb);
        

        if (this.configFile != '') {
            ret += '!include ' + this.configFile + '\n';
        }
        ret += Puml.httpMethodColors + '\n';
        ret += Puml.statusFunctions + '\n';
        ret += this.skinparam('global');
        ret += this.skinparam('sequence');
        
        if (this.showLegend) {
            ret += '\nlegend\n';
            let sum = this.defn.paths[params.url][params.verb].summary || '';
            if (sum) {
                ret += `<b>${sum}\n\n`;
            }
            ret += '|= HTTP Status |= Reason Phrase |\n';
            ret += statuses.sort().map(x => `| ${this.getStatusFunction(x)} | ${Diagram.statuscodes.find(y => y.code === x).reasonphrase} |`).join('\n');
            ret += '\nendlegend\n\n'
        }
        if (this.showTitle) {
            ret += 'title ' + this.getOperationId(params.url, params.verb) + '\n\n';
        }

        // params.verb = (!params.verb) ? 'get' : params.verb;
        params.client = (!params.client) ? 'Client' : params.client;
        params.gw = (!params.gw) ? 'API Gateway' : params.gw;
        // params.autonumber = (!params.autonumber) ? false : params.gw;

        ret += `participant "${params.client}" as C\n`;
        ret += `participant "${params.gw}" as G\n`;
        
        if (params.server) {
            params.server = params.server.replace('%apiname%', this.defn.info.title);
            params.server= params.server.replace('%version%', this.defn.info.version);
            ret += `participant "${params.server}" as B\n`;
        }

        ret += `C->G: ${params.verb.toUpperCase()} ${params.path}\n`;
        ret += 'activate G\n';
        if (params.server) {
            ret += `G->B: request to API service\n`;
            ret += `B-->G: response from API service\n`;
        }
        // statuses = Object.keys(this.defn.paths[params.url][params.verb].responses).sort();

        ret += 'alt ';
        for (let S of statuses) {
            // ret += this.defn.paths[params.url][params.verb].responses[S].description || (S.charAt(0) === '2' ? 'Successful Request' : 'UnSuccessful Request');
            ret += this.defn.paths[params.path][params.verb].responses[S].description + '\n';
            ret += 'G-->C: HTTP ';
            ret += this.getStatusFunction(S);
            ret += '\nelse ';
        }
        

        ret += '\ndeactivate G\n';
        ret += 'end\n';
        ret += '@enduml';
        
        this.value = ret;
        return ret;
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

        this.value = `http://www.plantuml.com/plantuml/${imgfmt}/${plantumlEncoder.encode(value)}`;
        return this.value;
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
        let given_paths = d.getPaths(d.defn.paths);

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
                    for (let M of Object.keys(d.defn.paths[P])) {
                        str += star.repeat(S+indent+1) + '_ ' + M.toUpperCase() + '\n';
                    }
                }
            }
        }
        return str;
    }
    
}

/**
* Holds the colors associated with the HTTP methods (verbs) 
*/
Puml.httpMethodColors = Diagram.httpMethodColors.map(x => `!${x.heading} = "<color ${x.color}>${x.heading}</color>"`).join('\n');

/**
* Holds all of the puml functions for success, warning and failure cases
*/
Puml.statusFunctions = `!if %not(%function_exists("$success"))\n!function $success($msg)\n<font color=green><b>$msg\n!endfunction\n!endif\n!if %not(%function_exists("$failure"))\n!function $failure($msg)\n<font color=red><b>$msg\n!endfunction\n!endif\n!if %not(%function_exists("$warning"))\n!function $warning($msg)\n<font color=orange><b>$msg\n!endfunction\n!endif`;


module.exports = {
    Puml: Puml
}