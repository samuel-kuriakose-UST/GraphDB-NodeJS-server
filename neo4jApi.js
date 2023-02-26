const res = require('express/lib/response');
const { json } = require('express/lib/response');
const neo4j = require('neo4j-driver');

const uri = 'neo4j+s://9895711b.databases.neo4j.io:7687';
// const uri = 'bolt+s://9895711b.databases.neo4j.io:7687';
const user = 'neo4j';
const password = 'w_g9DZtWUPM3u7uA2UG0OV5ze3GCPY1D-GkspfbhCEg';

// creating driver instance
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// CREATE A RELATIONSHIP BETWEEN TWO GIVEN NODES
async function createRelationship(person1Name, person2Name, relationship) {
  const session = driver.session({ database: 'neo4j' });

  try {
    const writeQuery = `MERGE (p1:Person { name: $person1Name })
                        MERGE (p2:Person { name: $person2Name })
                        MERGE (p1)-[:${relationship}]->(p2)
                        RETURN p1, p2`;

    // Write transactions allow the driver to handle retries and transient errors.
    const writeResult = await session.executeWrite(tx =>
      tx.run(writeQuery, { person1Name, person2Name })
    );

    // Check the write results.
    writeResult.records.forEach(record => {
      const person1Node = record.get('p1');
      const person2Node = record.get('p2');
      console.info(`Created relationship between: ${person1Node.properties.name}, ${person2Node.properties.name}\nRelationship type: ${relationship}`);
    });

  } catch (error) {
    console.error(`Something went wrong: ${error}`);
  } finally {
    // Close down the session if you're not using it anymore.
    await session.close();
    // Don't forget to close the driver connection when you're finished with it.
    // await driver.close();
  }
}

// GET ALL THE NODES DATA FROM DB
async function getAllNodes() {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (n) RETURN (n)`
    );
    const nodes = result.records.map(record => {
      const node = {};
      node.label = record.get('n').properties.name;
      node.id = record.get('n').identity.toString();
      return node;
    });
    return nodes;
  } finally {
    await session.close();
  }
}

// GET ALL THE EDGES DATA FROM THE DB
async function getAllEdges() {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH ()-[r]->()
       RETURN r`
    );
    // console.log(`All Edges Data from Neo4J:\n ${JSON.stringify(result)}\n\n`);
    const relationships = result.records.map(record => {
      const relationshipRecord = record.get('r');
      const relationship = {};
      if (relationshipRecord) {
        relationship.source = relationshipRecord.start.low.toString();
        relationship.target = relationshipRecord.end.low.toString();
        relationship.id = relationshipRecord.identity.toString();
        relationship.label = relationshipRecord.type.toString();
      }
      return relationship;
    }).filter(relationship => relationship !== null);
    return relationships;
  } finally {
    await session.close();
  }
}

// GET ALL SUBNODES OF GIVEN NODE
async function getFilteredNodes(nodeName) {
  console.log(`Params.name: ${nodeName}`);
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (n)-[*]->(sub)
       WHERE n.name= $nodeName
       RETURN DISTINCT sub
       `,{nodeName});
    // console.log(`Filtered nodes data from Neo4j:\n\n${JSON.stringify(result)}`);

    const filteredNodes = result.records.map(record => {
      const node = {};
      node.label= record.get('sub').properties.name;
      node.id = record.get('sub').identity.toString();
      return node;
    });

    const idResult= await session.run(
      `MATCH (n {name: $nodeName}) 
       RETURN ID(n) as id`,{nodeName});

    const nodeId = idResult.records.map(record => {
      const idData = record.get('id');
      // console.log(`\n\nrecord.get('id'): \n${idData}`);
      const id = idData.low.toString();
      return id;
    });


    filteredNodes.push({label:nodeName,id:nodeId[0] });
    // console.log(`filteredNodes data from Neo4j:\n\n${JSON.stringify(filteredNodes)}\n`);
    return filteredNodes;
    // return idResult;
  } catch(error){
    console.log(error);
  } finally {
    await session.close();
  }
}


/* 
GET ALL THE NODES AND RELATIONSHIPS FROM DB
NB: This API is not used currently. To optimize, getAllNodes
and getAllEdges were derived from this API
 */
async function getAllNodesAndRelationships() {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (n)
         OPTIONAL MATCH (n)-[r]->(m)
         RETURN DISTINCT n, r, m`
    );
    console.log(`All nodes and relationships data from Neo4J${JSON.stringify(result)}`);
    const nodes = result.records.map(record => {
      const node = record.get('n').properties;
      node.id = record.get('n').identity.toString();
      return node;
    });

    const relationships = result.records.map(record => {
      const relationship = record.get('r');
      if (relationship) {
        relationship.start = relationship.start.toString();
        relationship.end = relationship.end.toString();
        relationship.id = relationship.identity.toString();
      }
      return relationship;
    }).filter(relationship => relationship !== null);
    return { nodes, relationships };
  } finally {
    await session.close();
  }
}


module.exports = {
  createRelationship, getAllNodes, getAllEdges, getFilteredNodes, getAllNodesAndRelationships
};




//UNUSED CODE:

/* 
GET ALL THE NODES AND RELATIONSHIPS FROM DB
NB: This API is not used currently. To optimize, getAllNodes
and getAllEdges were derived from this API
 */


