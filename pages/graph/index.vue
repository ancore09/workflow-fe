<script setup lang="ts">
import {
  type VNetworkGraph,
  type Edges,
  type Nodes,
  defineConfigs,
  type VNetworkGraphInstance,
  type EventHandlers,
  VEdgeLabel, type Layouts
} from "v-network-graph";
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
//@ts-ignore
import dagre from "dagre/dist/dagre.min.js"

import Toolbar from 'primevue/toolbar';

import {useWorkflowStore} from "~/stores/workflowStore";
import {storeToRefs} from "pinia";

const workflowStore = useWorkflowStore();

const graph = ref<VNetworkGraphInstance>()

const nodeSize = 40

const {nodes, edges, layouts, configs } = storeToRefs(workflowStore);

// const configs = reactive({
//   node: {
//     normal: { radius: nodeSize / 2 },
//     label: {
//       visible: true,
//       direction: "center",
//       color: '#fff',
//       directionAutoAdjustment: true,
//     },
//     selectable: 2, // up to 2 nodes
//   },
//   edge: {
//     selectable: true,
//     normal: {
//       width: 3,
//     },
//     marker: {
//       target: {
//         type: 'arrow',
//         width: 3
//       }
//     }
//   },
//   view: {
//     boxSelectionEnabled: true,
//     autoPanAndZoomOnLoad: "fit-content",
//     // onBeforeInitialDisplay: () => layout("TB"),
//     selection: {
//       box: {
//         color: "#0000ff20",
//         strokeWidth: 1,
//         strokeColor: "#aaaaff",
//         strokeDasharray: "0",
//       },
//     },
//   },
// })
//
// const nodes: Nodes = reactive({
//   node1: { name: "Node 1", handler: "some handler", outputs: ["some output 1", "some output 2"], condition: "" },
//   node2: { name: "Node 2", handler: "another handler", outputs: ["another output"], condition: "" },
//   node3: { name: "Node 3", handler: "some handler", outputs: ["some result"], condition: "" },
//   node4: { name: "Node 4", handler: "aggregation handler", outputs: ["overall result"], condition: "" },
// })
//
// const edges: Edges = reactive({
//   edge1: { source: "node1", target: "node2", label: "edge1" },
//   edge2: { source: "node2", target: "node3", label: "edge2" },
//   edge3: { source: "node3", target: "node4", label: "edge3" },
// })
//
// const layouts: Layouts = reactive({
//   nodes: {
//     node1: { x: 0, y: 0 },
//     node2: { x: 100, y: 50 },
//     node3: { x: 200, y: -50 },
//     node4: { x: 300, y: 0 },
//   },
// })

const nextNodeIndex = ref(Object.keys(nodes.value).length + 1)
const nextEdgeIndex = ref(Object.keys(edges.value).length + 1)

const selectedNodes = ref<string[]>([])
const selectedEdges = ref<string[]>([])

const selectedNodeWithAlt = ref<string>("node1");

const isBoxSelectionMode = ref(false)
const eventHandlers: EventHandlers = {
  "view:mode": mode => {
    // Observe mode change events
    isBoxSelectionMode.value = mode === "box-selection"
  },
  "node:click": ({ node, event }) => {
    if (event.altKey) {
      selectedNodeWithAlt.value = node
      console.log(node)
    }
  },
  "edge:click": ({ edge, event }) => {
    if (event.altKey) {
      console.log(edge)
    }
  }
}

function layout(direction: "TB" | "LR") {
  if (Object.keys(nodes).length <= 1 || Object.keys(edges).length == 0) {
    return
  }

  // convert graph
  // ref: https://github.com/dagrejs/dagre/wiki
  const g = new dagre.graphlib.Graph()
  // Set an object for the graph label
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSize * 2,
    edgesep: nodeSize,
    ranksep: nodeSize * 2,
  })
  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => ({}))

  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node. In this case we're going to add labels to each of
  // our nodes.
  Object.entries(nodes.value).forEach(([nodeId, node]) => {
    g.setNode(nodeId, { label: node.name, width: nodeSize, height: nodeSize })
  })

  // Add edges to the graph.
  Object.values(edges.value).forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  g.nodes().forEach((nodeId: string) => {
    // update node position
    const x = g.node(nodeId).x
    const y = g.node(nodeId).y
    layouts.value.nodes[nodeId] = { x, y }
  })
}

function updateLayout(direction: "TB" | "LR") {
  // Animates the movement of an element.
  graph.value?.transitionWhile(() => {
    layout(direction)
  })
}

function addNode() {
  const nodeId = `node${nextNodeIndex.value}`
  const name = `Node ${nextNodeIndex.value}`
  nodes.value[nodeId] = { name, handler: "", outputs: [""], condition: "" }
  nextNodeIndex.value++
}


function removeNode() {
  for (const nodeId of selectedNodes.value) {
    delete nodes.value[nodeId]
    for (let edgesKey in edges.value) {
      if (edges.value[edgesKey].source == nodeId || edges.value[edgesKey].target == nodeId) {
        delete edges.value[edgesKey]
      }
    }
  }
}

function addEdge() {
  if (selectedNodes.value.length !== 2) return
  const [source, target] = selectedNodes.value
  const edgeId = `edge${nextEdgeIndex.value}`
  edges.value[edgeId] = { source, target, label: edgeId }
  nextEdgeIndex.value++
}

function removeEdge() {
  for (const edgeId of selectedEdges.value) {
    delete edges.value[edgeId]
  }
}

function parseWorkflow() {
  let workflow: Record<string, any> = {};

  for (let nodeId in nodes.value) {
    workflow[nodeId] = nodes.value[nodeId];
    workflow[nodeId]["dependencies"] = []
  }

  for (let edgeId in edges.value) {
    let edge = edges.value[edgeId];
    workflow[edge.target]["dependencies"].push(edge.source);
  }

  return workflow
}

const workflow = computed(() => JSON.stringify(parseWorkflow(), null, 2))
</script>

<template>
  <div class="card">
    <Splitter layout="vertical" style="height: 100vh">
      <SplitterPanel>

        <Splitter>
          <SplitterPanel class="flex flex-column align-items-stretch items-center justify-center" :size="80">
              <Toolbar class="shadow-1 flex-none">
                <template #start>
                  <Button icon="pi pi-plus" label="Add Node" class="mr-2" severity="secondary" text @click="addNode()" />
                  <Button icon="pi pi-arrow-up-right" label="Add Edge" class="mr-2" severity="secondary" text @click="addEdge()" />
                  <Button icon="pi pi-minus" label="Remove Node" class="mr-2" severity="secondary" text @click="removeNode()" />
                  <Button icon="pi pi-minus" label="Remove Edge" class="mr-2" severity="secondary" text @click="removeEdge()" />
                </template>

                <template #center>
                  <Button icon="pi pi-search" label="Fit" class="mr-2" severity="secondary" text @click="graph?.fitToContents()" />
                  <Button icon="pi pi-arrow-right" label="Left To Right" class="mr-2" severity="secondary" text @click="updateLayout('LR')" />
                  <Button icon="pi pi-arrow-down" label="Top To Bottom" class="mr-2" severity="secondary" text @click="updateLayout('TB')" />
                </template>

                <template #end>
                  <Button icon="pi pi-save" label="Save" class="mr-2" severity="secondary" text @click="workflowStore.save()" />
                </template>
              </Toolbar>
              <div class="flex-grow-1">
                <v-network-graph
                    ref="graph"
                    v-model:selected-nodes="selectedNodes"
                    v-model:selected-edges="selectedEdges"
                    :nodes="nodes"
                    :edges="edges"
                    :configs="configs"
                    :layouts="layouts"
                    :event-handlers="eventHandlers"
                    class="graph ">

                  <template #edge-label="{ edge, ...slotProps }">
                    <v-edge-label :text="edge.label" align="center" vertical-align="above" v-bind="slotProps" />
                  </template>

                </v-network-graph>
              </div>
          </SplitterPanel>
          <SplitterPanel class="flex items-center justify-center" :size="20">
            <NodeEdit :node="nodes[selectedNodeWithAlt]" />
          </SplitterPanel>
        </Splitter>

      </SplitterPanel>

      <SplitterPanel class="m-2" :size="10">
        <div>
<!--          <div class="m-2 p-2" style="border: 1px solid black;">-->
<!--            nodes: {{nodes}}-->
<!--          </div>-->
<!--          <div class="m-2 p-2" style="border: 1px solid black;">-->
<!--            edges: {{edges}}-->
<!--          </div>-->
<!--          <div class="m-2 p-2" style="border: 1px solid black;">-->
<!--            layouts: {{layouts}}-->
<!--          </div>-->
          <div class="m-2 p-2" style="border: 1px solid black;">
            workflow:
            <pre class="h-30rem overflow-y-scroll">
              {{workflow}}
            </pre>
          </div>
        </div>
      </SplitterPanel>

    </Splitter>


  </div>
</template>

<style scoped>

</style>