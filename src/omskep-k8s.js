//
// This file contains Kubernetes methods that get mixed in to the classes
//

let k8s = {
    /**
    * Gets all the deployments names json file
    */
    getDeployInfo() {
        //
        // If there are multiple deployments per file
        // then there will be an items array
        //
        let ret = [];
        let items = this.defn.items ? this.defn.items : [this.defn];
        for (const i of items) {
            let name = i.metadata.name || '';
            let replicas = i.spec.replicas || 0;;
            let labels = i.metadata.labels || '';
            // taking first container and first port, not sure if this will be a problem or not
            let portnum = i.spec.template.spec.containers[0].ports[0].containerPort || '';
            ret.push({name: name, replicas: replicas, labels: labels, portnum: portnum});
        }
            // console.log(this.defn.items[0].spec.template.spec.containers[0].ports[0].containerPort);
            // return this.defn.items.map(x => ({name: (x.metadata.name || ''), replicas: (x.spec.replicas), labels: (x.metadata.labels)}));
        return ret;
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
