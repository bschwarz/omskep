//
// This file contains Kubernetes methods that get mixed in to the classes
//

let k8s = {
    /**
    * Gets all the deployments names json file
    */
    getDeployInfo() {
        if (this.defn.items) {
            return this.defn.items.map(x => ({name: (x.metadata.name || ''), replicas: (x.spec.replicas)}));
            // return this.defn.items;
        }
        return this.defn.metadata || '';
    },
    /**
    * Gets the namespace for the deployment
    */
   getNamespace() {
    if (this.defn.items) {
        return this.defn.items[0].metadata.namespace;
    }
    return this.defn.metadata.namespace || '';
}
}

module.exports.k8s = k8s;
