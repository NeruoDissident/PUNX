// graph3d.js
// Renders a 3-D force-directed graph using 3d-force-graph

let fg = null;

function ensure3DContainer() {
  let c = document.getElementById('graph3d');
  if (!c) {
    c = document.createElement('div');
    c.id = 'graph3d';
    c.style.position = 'absolute';
    c.style.top = '0';
    c.style.left = '0';
    c.style.width = '100vw';
    c.style.height = '100vh';
    c.style.display = 'none';
    c.style.zIndex = '900';
    document.body.appendChild(c);
  }
  return c;
}

function cyTo3DData(cy) {
  const nodes = cy.nodes().map(n => ({
    id: n.id(),
    type: n.data('type'),
    years: n.data('years'),
    color: n.style('background-color') || (n.data('type') === 'band' ? '#2E86AB' : '#E67E22')
  }));
  const links = cy.edges().map(e => ({
    source: e.data('source'),
    target: e.data('target'),
    color: e.style('line-color') || '#cccccc'
  }));
  return { nodes, links };
}

function init3DGraph(data) {
  const container = ensure3DContainer();
  fg = ForceGraph3D()(container)
    .nodeId('id')
    .nodeLabel('id')
    .nodeColor(d => d.color)
    .linkColor(l => l.color)
    .linkDirectionalArrowLength(3)
    .linkDirectionalArrowRelPos(1);
  fg.graphData({ nodes: data.nodes, links: data.links });
}

window.graph3D = {
  show(cy) {
    const container = ensure3DContainer();
    const data = cyTo3DData(cy);
    if (!fg) init3DGraph(data);
    else fg.graphData({ nodes: data.nodes, links: data.links });
    container.style.display = 'block';
    fg.resumeAnimation();
  },
  hide() {
    const container = document.getElementById('graph3d');
    if (container) container.style.display = 'none';
    if (fg) fg.pauseAnimation();
  }
};
