const { json } = require("express/lib/response");
const { isTime } = require("neo4j-driver");




var filterSubNodeEdges = function (allEdges, filteredNodes) {
    var filteredNodesIds = [];
    filteredNodes.forEach(nodeData => {
        var arr = [];
        filteredNodesIds.push(nodeData.id);
    });

    console.log(`\nAll edges: ${JSON.stringify(allEdges)}\n\nFilrered nodes: ${JSON.stringify(filteredNodes)}\n`);
    console.log(`Fileterd node ids: ${filteredNodesIds}`);
    let fileredEdges = [];
    allEdges.forEach(edgeData => {
        if (filteredNodesIds.includes(edgeData.source) && filteredNodesIds.includes(edgeData.target)) {
            fileredEdges.push(edgeData);
        };
    });
    console.log(`\nFiltered edges object: ${JSON.stringify(fileredEdges)}`);
    return fileredEdges;
}



var filterNonPeerEdges = function(halfFilteredEdges) {
    fullfilteredEdges = [];
    halfFilteredEdges.forEach(edgeData => {
        if(edgeData.label != "PEER"){
            fullfilteredEdges.push(edgeData);
        }
    });
    return fullfilteredEdges;
}

var filterOutSoloNodes = function(halfFilteredNodes,fullFilteredEdges) {
    const allConnectedNodes = [];
    fullFilteredEdges.forEach(edgeData => {
        allConnectedNodes.push(edgeData.source);
        allConnectedNodes.push(edgeData.target);
    });
    const fullFilteredNodes  =[];
    halfFilteredNodes.forEach(nodeData => {
        if(allConnectedNodes.includes(nodeData.id)) {
            fullFilteredNodes.push(nodeData);
        }
    
    });

    return fullFilteredNodes;
}

module.exports = { filterSubNodeEdges, filterNonPeerEdges,filterOutSoloNodes };

// TO FILTER ALL NON PEER NODES 
/* var filterNonPeerNodes = function (allEdges, halfFilteredNodes) {
    var nodesHavingPeer = [];
    allEdges.forEach(edgeData => {
        if (edgeData.label == "PEER") {
            nodesHavingPeer.push(edgeData.source);
            nodesHavingPeer.push(edgeData.target);
        }
    });

    fullFilteredNodes = [];
    // halfFilteredNodes.forEach(nodeData => {
    //     if
    // })a

    console.log(`nodesHavingPeer: ${nodesHavingPeer}`);
    //change return nodesHavingPeer
    return nodesHavingPeer;
} */

/* var nodeRefiner = function (nodeListObject) {
    var Node = [];
    nodeListObject.forEach(node => {
        tempObj = {
            id: node.id,
            label: node.name
        };
        Node.push(tempObj);

    });
    return Node;
    // console.log(nodeListObject);
};

var edgeRefiner = function (edgeListObject) {
    var Edge = [];
    edgeListObject.forEach(relationship => {
        tempObj = {
            id: relationship.id,
            source: relationship.start,
            target: relationship.end,
            label: relationship.type

        };
        Edge.push(tempObj);

    });
    return Edge;
}; */