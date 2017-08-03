const getUniqueHash = (function() {
    return function(startingIndex) {
        return startingIndex++;
    };
})(0);

export default class VariableTable {
    constructor() {
        this.root = [];
    }

    add(node) {
        const id = getUniqueHash();

        node.hash = id;
        this.root[id] = node;

        return id;
    }

    getByName(name) {
        return this.root.filter(elem => elem.name === name)[0];
    }
}

export class Node {
    constructor(hash, name, value, children) {
        this.hash = hash;
        this.name = name;
        this.value = value;
        this.children = children; 
    }   
}

