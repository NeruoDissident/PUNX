// clusterControl.js
// Handles clustering of highlighted nodes

let clusters = [];
let clusterColors = [];
let selectedClusterColor = null;

function getRandomColor() {
  const h = Math.floor(Math.random() * 360);
  return `hsl(${h}, 70%, 75%)`;
}

function createClusterUI() {
  let panel = document.getElementById('clusterPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'clusterPanel';
    panel.style.position = 'absolute';
    panel.style.top = '60px'; // Align with main control panel
    panel.style.left = '180px'; // Position next to the main panel
    panel.style.zIndex = 1005;
    panel.style.background = 'rgba(255,255,255,0.95)';
    panel.style.padding = '10px';
    panel.style.borderRadius = '8px';
    panel.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)';
    panel.style.border = '1px solid #ddd';
    panel.style.display = 'none'; // Initially hidden
    panel.style.minWidth = '220px';
    document.body.appendChild(panel);
  }
  
  panel.innerHTML = `
    <div style="margin-bottom: 10px; font-weight: bold; color: #333;">Create Cluster</div>
    <div style="margin-bottom: 10px;">
      <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">Cluster Color:</label>
      <div style="display: flex; gap: 5px; margin-bottom: 5px;">
        <input type="color" id="clusterColorPicker" value="#FFD700" style="width: 40px; height: 30px; border: none; border-radius: 4px; cursor: pointer;">
        <button id="randomColorBtn" style="padding: 5px 10px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-size: 11px;">Random</button>
      </div>
    </div>
    <div style="display: flex; gap: 5px;">
      <button id="createClusterBtn" style="flex: 1; padding: 8px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Create Cluster</button>
      <button id="cancelClusterBtn" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
    </div>
  `;
  
  // Add event listeners
  const colorPicker = document.getElementById('clusterColorPicker');
  const randomBtn = document.getElementById('randomColorBtn');
  const createBtn = document.getElementById('createClusterBtn');
  const cancelBtn = document.getElementById('cancelClusterBtn');
  
  randomBtn.onclick = () => {
    const randomColor = getRandomColor();
    // Convert HSL to hex for color picker
    const tempDiv = document.createElement('div');
    tempDiv.style.color = randomColor;
    document.body.appendChild(tempDiv);
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    
    // Simple random hex color instead
    const hexColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    colorPicker.value = hexColor;
  };
  
  cancelBtn.onclick = () => {
    hideClusterButton();
  };
  
  return panel;
}

function showClusterButton() {
  const panel = createClusterUI();
  panel.style.display = 'block';
}

function hideClusterButton() {
  const panel = document.getElementById('clusterPanel');
  if (panel) panel.style.display = 'none';
}

// Create a persistent cluster from highlighted nodes, updating nodeClusters and focusedClusterIdx
function createCluster(cy, nodeClusters, clusters, clusterColors, setFocusedClusterIdx, customColor = null) {
  const highlighted = cy.nodes('.highlight');
  if (highlighted.length === 0) return;
  
  // Use custom color if provided, otherwise get random color
  const color = customColor || getRandomColor();
  const clusterIdx = clusters.length;
  
  // Store node references
  const nodes = highlighted.toArray();
  clusters.push({ nodes, color, clusterIdx });
  clusterColors.push(color);
  
  // Update nodeClusters for each node
  nodes.forEach(n => {
    if (!nodeClusters[n.id()]) nodeClusters[n.id()] = [];
    nodeClusters[n.id()].push({ color, clusterIdx });
    n.addClass('cluster-color');
    n.data('clusterColor', color);
    n.style('background-color', color);
  });
  
  // Set the focused cluster to the new one
  if (typeof setFocusedClusterIdx === 'function') setFocusedClusterIdx(clusterIdx);
  
  // Hide the cluster panel after creating
  hideClusterButton();
  
  console.log(`Created cluster ${clusterIdx} with ${nodes.length} nodes in color ${color}`);
}

// Setup event handlers for cluster creation
function setupClusterEvents(cy, nodeClusters, clusters, clusterColors, setFocusedClusterIdx, updateNodeColors) {
  // This will be called from main.js to setup the event handlers
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'createClusterBtn') {
      const colorPicker = document.getElementById('clusterColorPicker');
      const selectedColor = colorPicker ? colorPicker.value : null;
      createCluster(cy, nodeClusters, clusters, clusterColors, setFocusedClusterIdx, selectedColor);
      if (updateNodeColors) updateNodeColors();
    }
  });
}

// Generic utility to enable Ctrl+drag cluster movement
// getClusterNodes should return an array of nodes belonging to the same cluster
function setupClusterDrag(cy, getClusterNodes) {
  let isDragging = false;
  let dragStart = null;
  let dragNodes = [];

  cy.on('grab', 'node', function(evt) {
    const orig = evt.originalEvent;
    if (orig && orig.ctrlKey) {
      dragNodes = getClusterNodes(evt.target) || [];
      if (dragNodes.length > 0) {
        isDragging = true;
        dragStart = evt.target.position();
        dragNodes.forEach(n => {
          n.scratch('_offset', {
            x: n.position('x') - dragStart.x,
            y: n.position('y') - dragStart.y
          });
        });
      }
    }
  });

  cy.on('drag', 'node', function(evt) {
    if (isDragging && dragStart) {
      const pos = evt.target.position();
      dragNodes.forEach(n => {
        const offset = n.scratch('_offset');
        if (offset) n.position({ x: pos.x + offset.x, y: pos.y + offset.y });
      });
    }
  });

  cy.on('free', 'node', function() {
    if (isDragging) {
      dragNodes.forEach(n => n.removeScratch('_offset'));
      dragNodes = [];
      isDragging = false;
      dragStart = null;
    }
  });
}

window.clusterControl = {
  show: showClusterButton,
  hide: hideClusterButton,
  createCluster: createCluster,
  setupEvents: setupClusterEvents,
  setupDrag: setupClusterDrag
};
