//
// This file contains AWS methods that get mixed in to the classes
//

let cloudformation = {
    /**
    * Gets all the resources in a cloud formation file, sorted by alpha and length
    */
    getResources() {
        const sf = function(a,b) {return a.localeCompare(b, 'en', {'sensitivity': 'base'});}
        let ret = [];
        for (let R of Object.keys(this.defn.Resources).sort(sf)) {
            ret.push({id: R, type: this.defn.Resources[R].Type});
        };
        return ret;
    },
}

module.exports = {
    cloudformation: cloudformation
}