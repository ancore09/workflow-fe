import { defineStore } from 'pinia'
import type {Edges, Layouts, Nodes} from "v-network-graph";

const getDefaultSettings = () =>{
    const nodeSize = 40

    const configs = {
        node: {
            normal: { radius: nodeSize / 2 },
            label: {
                visible: true,
                direction: "center",
                color: '#fff',
                directionAutoAdjustment: true,
            },
            selectable: 2, // up to 2 nodes
        },
        edge: {
            selectable: true,
            normal: {
                width: 3,
            },
            marker: {
                target: {
                    type: 'arrow',
                    width: 3
                }
            }
        },
        view: {
            boxSelectionEnabled: true,
            autoPanAndZoomOnLoad: "fit-content",
            // onBeforeInitialDisplay: () => layout("TB"),
            selection: {
                box: {
                    color: "#0000ff20",
                    strokeWidth: 1,
                    strokeColor: "#aaaaff",
                    strokeDasharray: "0",
                },
            },
        },
    }

    const nodes: Nodes = {
        node1: { name: "Node 1", handler: "some handler", outputs: ["some output 1", "some output 2"], condition: "" },
        node2: { name: "Node 2", handler: "another handler", outputs: ["another output"], condition: "" },
        node3: { name: "Node 3", handler: "some handler", outputs: ["some result"], condition: "" },
        node4: { name: "Node 4", handler: "aggregation handler", outputs: ["overall result"], condition: "" },
    }

    const edges: Edges = {
        edge1: { source: "node1", target: "node2", label: "edge1" },
        edge2: { source: "node2", target: "node3", label: "edge2" },
        edge3: { source: "node3", target: "node4", label: "edge3" },
    }

    const layouts: Layouts = {
        nodes: {
            node1: { x: 0, y: 0 },
            node2: { x: 100, y: 50 },
            node3: { x: 200, y: -50 },
            node4: { x: 300, y: 0 },
        },
    }

    return { nodes, edges, layouts, configs }
}

const getSettings = () => {
    const saved = localStorage.getItem('workflowStore');
    console.log(saved)

    return saved ? JSON.parse(saved) : getDefaultSettings()
}

export const useWorkflowStore = defineStore('workflow', () => {

    let {nodes, edges, layouts, configs} = getSettings()

    const configst = reactive(configs)

    const nodest: Nodes = reactive(nodes)

    const edgest: Edges = reactive(edges)

    const layoutst: Layouts = reactive(layouts)

    function save() {
        localStorage.setItem("workflowStore", JSON.stringify({ nodes: nodest, edges: edgest, layouts: layoutst, configs: configst }))
    }

    return { nodes: nodest, edges: edgest, layouts: layoutst, configs: configst, save }
})