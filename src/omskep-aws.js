//
// This file contains AWS methods that get mixed in to the classes
//

let cft = {
    /**
    * Gets all the resources in a cloud formation file, sorted by alpha and length
    */
    getResources() {
        let ret = [];
        for (let R of Object.keys(this.defn.Resources)) {
            ret.push({id: R, type: this.defn.Resources[R].Type});
        };
        return ret;
    },
}

module.exports = {
    cft: cft
}