(function(global){
  // depthControl.js
  // Handles +/- depth controls for highlight expansion/contraction

  let highlightSeedNode = null;
  let highlightDepth = 1;

  function showDepthControls() {
    let controls = document.getElementById('depthControls');
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'depthControls';
      controls.className = 'depth-controls';
      controls.style.top = '60px';
      controls.style.left = '10px';
      controls.innerHTML = `
        <button id="depthMinus" class="btn depth-btn">-</button>
        <span id="depthLevel" style="margin:0 8px;font-weight:bold;">1</span>
        <button id="depthPlus" class="btn depth-btn">+</button>
      `;
      document.body.appendChild(controls);
    }
    controls.style.display = 'block';
    document.getElementById('depthLevel').textContent = highlightDepth;
  }

  function hideDepthControls() {
    let controls = document.getElementById('depthControls');
    if (controls) controls.style.display = 'none';
  }

  function getHighlightNodes(seed, depth) {
    let visited = new Set([seed.id()]);
    let currentLayer = [seed];
    for (let d = 0; d < depth; d++) {
      let nextLayer = [];
      for (let node of currentLayer) {
        node.neighborhood('node').forEach(n => {
          if (!visited.has(n.id())) {
            visited.add(n.id());
            nextLayer.push(n);
          }
        });
      }
      currentLayer = nextLayer;
    }
    return Array.from(visited);
  }

  function updateHighlight(cy, seed, depth) {
    cy.elements().removeClass('highlight faded');
    let nodesToHighlight = getHighlightNodes(seed, depth);
    nodesToHighlight.forEach(id => {
      cy.getElementById(id).addClass('highlight');
    });
    cy.nodes().filter(n => !nodesToHighlight.includes(n.id())).addClass('faded');
  }

  function setupDepthControls(cy) {
    document.addEventListener('click', function(e) {
      if (e.target && e.target.id === 'depthPlus') {
        highlightDepth++;
        document.getElementById('depthLevel').textContent = highlightDepth;
        updateHighlight(cy, highlightSeedNode, highlightDepth);
      }
      if (e.target && e.target.id === 'depthMinus') {
        if (highlightDepth > 1) {
          highlightDepth--;
          document.getElementById('depthLevel').textContent = highlightDepth;
          updateHighlight(cy, highlightSeedNode, highlightDepth);
        }
      }
    });
  }

  global.depthControl = {
    show: showDepthControls,
    hide: hideDepthControls,
    setup: setupDepthControls,
    setSeed: function(node, cy) {
      highlightSeedNode = node;
      highlightDepth = 1;
      showDepthControls();
      updateHighlight(cy, node, 1);
    }
  };
})(window);

