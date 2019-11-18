//
// This file contains Azure methods that get mixed in to the classes
//

let arm = {
    /**
    * Gets all the resources in a azure arm file, sorted by alpha and length
    */
    getResources() {
        let ret = [];
        for (let R of this.defn.resources) {
            ret.push({id: R.name, type: R.type});
        };
        return ret;
    },
}

module.exports = {
    arm: arm
}