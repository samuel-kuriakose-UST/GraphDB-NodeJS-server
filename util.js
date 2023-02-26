const { json } = require("express/lib/response");


var nodeRefiner = function (nodeListObject) {
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
};

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


module.exports = { nodeRefiner, edgeRefiner, filterSubNodeEdges };