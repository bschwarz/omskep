//
// This file contains Kubernetes methods that get mixed in to the classes
//

let k8s = {
    /**
    * Gets all the deployments names json file
    */
    getDeployNames() {
        if (this.defn.items) {
            return this.defn.items.map(x => (x.metadata || ''));
            // return this.defn.items;
        }
        return this.defn.metadata || '';
    }
}

module.exports.k8s = k8s;
