(function(global){
  // clusterControl.js
  // Handles clustering of highlighted nodes

  const clusters = [];
  const clusterColors = [];
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
      panel.className = 'panel cluster-panel';
      panel.style.top = '60px';
      panel.style.left = '180px';
      panel.style.display = 'none';
      document.body.appendChild(panel);
    }

    panel.innerHTML = `
      <div class="panel-header">Create Cluster</div>
      <div style="margin-bottom:10px;">
        <label style="display:block;margin-bottom:5px;font-size:12px;color:#666;">Cluster Color:</label>
        <div style="display:flex;gap:5px;margin-bottom:5px;">
          <input type="color" id="clusterColorPicker" value="#FFD700" style="width:40px;height:30px;border:none;border-radius:4px;cursor:pointer;">
          <button id="randomColorBtn" class="btn btn-default">Random</button>
        </div>
      </div>
      <div style="display:flex;gap:5px;">
        <button id="createClusterBtn" class="btn btn-green" style="flex:1;">Create Cluster</button>
        <button id="cancelClusterBtn" class="btn btn-red">Cancel</button>
      </div>
    `;

    const colorPicker = document.getElementById('clusterColorPicker');
    const randomBtn = document.getElementById('randomColorBtn');
    const cancelBtn = document.getElementById('cancelClusterBtn');

    randomBtn.onclick = () => {
      const randomColor = getRandomColor();
      const tempDiv = document.createElement('div');
      tempDiv.style.color = randomColor;
      document.body.appendChild(tempDiv);
      const computedColor = window.getComputedStyle(tempDiv).color;
      document.body.removeChild(tempDiv);
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

  function createCluster(cy, nodeClusters, clustersArr, colorsArr, setFocusedClusterIdx, customColor = null) {
    const highlighted = cy.nodes('.highlight');
    if (highlighted.length === 0) return;
    const color = customColor || getRandomColor();
    const clusterIdx = clustersArr.length;

    const nodes = highlighted.toArray();
    clustersArr.push({ nodes, color, clusterIdx });
    colorsArr.push(color);

    nodes.forEach(n => {
      if (!nodeClusters[n.id()]) nodeClusters[n.id()] = [];
      nodeClusters[n.id()].push({ color, clusterIdx });
      n.addClass('cluster-color');
      n.data('clusterColor', color);
      n.style('background-color', color);
    });

    if (typeof setFocusedClusterIdx === 'function') setFocusedClusterIdx(clusterIdx);
    hideClusterButton();
    console.log(`Created cluster ${clusterIdx} with ${nodes.length} nodes in color ${color}`);
  }

  function setupClusterEvents(cy, nodeClusters, clustersArr, colorsArr, setFocusedClusterIdx, updateNodeColors) {
    document.addEventListener('click', function(e) {
      if (e.target && e.target.id === 'createClusterBtn') {
        const colorPicker = document.getElementById('clusterColorPicker');
        const selectedColor = colorPicker ? colorPicker.value : null;
        createCluster(cy, nodeClusters, clustersArr, colorsArr, setFocusedClusterIdx, selectedColor);
        if (updateNodeColors) updateNodeColors();
      }
    });
  }

  global.clusterControl = {
    show: showClusterButton,
    hide: hideClusterButton,
    createCluster: createCluster,
    setupEvents: setupClusterEvents,
    clusters,
    clusterColors
  };
})(window);

