const neo4jApi = require('./neo4jApi');
const express = require('express');
var cors = require('cors')
const util = require('./util');
const { RxSession } = require('neo4j-driver');

const app = express();
const port = 3000;


// parse JSON request bodies
app.use(express.json());
app.use(cors());

app.post('/api/add', async (req, res) => {
    await neo4jApi.createRelationship(req.body.node1Name, req.body.node2Name, req.body.relationship);
    // console.log(req.body);
    res.send('OK');
});


app.get('/api/nodes', async (req, res) => {
    const nodesData = await neo4jApi.getAllNodes();
    // console.log(JSON.stringify(nodesData));
    res.send(nodesData);
});

app.get('/api/edges', async (req, res) => {
    const edgesData = await neo4jApi.getAllEdges();
    // console.log(`Edges data from /api/edges API:\n\n ${JSON.stringify(edgesData)}`);
    res.send(edgesData);

});


app.get('/api/filteredNodes/:name', async (req, res) => {
    // console.log(`req.body : \n${JSON.stringify(req.body)}\n`)
    const filteredNodes = await neo4jApi.getFilteredNodes(req.params.name);
    res.send(filteredNodes);
});



app.get('/api/filteredEdges/:name', async (req, res) => {
    const allEdges = await neo4jApi.getAllEdges();
    const filteredNodes = await neo4jApi.getFilteredNodes(req.params.name);
    const filteredEdges = util.filterSubNodeEdges(allEdges, filteredNodes);
    res.send(filteredEdges);
})

app.get('/api/advancedFilteredNodes/:name', async (req, res) => {
    const allEdges = await neo4jApi.getAllEdges();
    const halfFilteredNodes = await neo4jApi.getAdvancedFilteredNodes(req.params.name);
    const halfFilteredEdges = util.filterSubNodeEdges(allEdges, halfFilteredNodes);
    const fullFilteredEdges = util.filterNonPeerEdges(halfFilteredEdges);
    const fullFilteredNodes = util.filterOutSoloNodes(halfFilteredNodes,fullFilteredEdges);
   

    res.send(fullFilteredNodes);
});

app.get('/api/advancedFilteredEdges/:name', async (req, res) => {
    const allEdges = await neo4jApi.getAllEdges();
    const halfFilteredNodes = await neo4jApi.getAdvancedFilteredNodes(req.params.name);
    const halfFilteredEdges = util.filterSubNodeEdges(allEdges, halfFilteredNodes);
    const fullFilteredEdges = util.filterNonPeerEdges(halfFilteredEdges);
    res.send(fullFilteredEdges);
})

app.post('/api/insertHeirarchy', async(req,res) => {
    const parentNodeName = req.body.parentNodeName;
    const childNodeName = req.body.childNodeName;
    const relationship = req.body.insersionRelationship;
    const immediateNodeNames = await neo4jApi.getImmediateNodes(parentNodeName);
    const immediateRelationshipNames = await neo4jApi.getImmediateRelationShips(parentNodeName);

    await neo4jApi.deleteImmediateRelationships(parentNodeName);
    await neo4jApi.createRelationship(parentNodeName,childNodeName,relationship);
    for(let i =0;i< immediateNodeNames.length;i++) {
        await neo4jApi.createRelationship(childNodeName,immediateNodeNames[i],immediateRelationshipNames[i]);
    }
    // await neo4jApi.remapRelationships(childNodeName, immediateNodes); // Not used for current logic
    res.send('OK');
});

// start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// INACTIVE APIS
app.get('/api/allData', async (req, res) => {
    // get all nodes and relationships
    const neo4jData = await neo4jApi.getAllNodesAndRelationships();
    const Node = refiner.nodeRefiner(neo4jData.nodes);
    const Edge = refiner.edgeRefiner(neo4jData.relationships);
    const ngxData = { Node, Edge };
    res.json(ngxData);
});




//UNUSED CODES

/*
THE FOLLOWING CODE RETRIVED ONLY EDGES
Drawbacks:
-> It initially retieves both nodes and edges data
-> Edges and Nodes have to be separated after retrieving data from Neo4j DB
-> Nodes and Edges data have to be cleaned and modified for matching the ngx-graph format
-> HENCE DISCARDED
*/
// app.get('/api/edges', async (req, res) => {
//     const neo4jData = await neo4jApi.getAllNodesAndRelationships();
//     const Edge = refiner.edgeRefiner(neo4jData.relationships);
//     res.send(Edge);

// });

/*
THE FOLLOWING CODE RETRIVED ONLY NODES BUT ALSO DUPLICATE NODES CAME ALONG WITH IT
Drawbacks:
-> It initially retieves both nodes and edges data and
-> Edges and Nodes have to be separated after retrieving data from Neo4j DB
-> Nodes and Edges data have to be cleaned and modified for matching the ngx-graph format
-> HENCE DISCARDED
*/
// app.get('/api/nodes', async (req, res) => {
//     const neo4jData = await neo4jApi.getAllNodesAndRelationships();
//     // console.log(JSON.stringify(neo4jData));
//     console.log(`typeof neo4jData.nodes: ${typeof neo4jData.nodes}`);
//     const Node = refiner.nodeRefiner(neo4jData.nodes);
//     console.log(`typeof Node: ${typeof Node}`);
//     console.log(`Node[] array for ngx-graph: ${JSON.stringify(Node)}`);
//     res.send(Node);

// });



/*
THE FOLLOWING CODE TO GET ALL THE NODES AND EDGES IN A SINGLE OBJECT
As the output of the code additional alteration before giving to ngx-graph, the code was discarded.
Now Nodes and Edges are retrieved using separate APIs
*/

