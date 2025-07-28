// main.js
// Handles Cytoscape graph logic and interactivity

// Data import
// (nodes and edges will be imported from data.js)

let cy;

function initializeGraph(nodes, edges) {
  cy = cytoscape({
    container: document.getElementById('cy'),
    elements: { nodes, edges },
    style: [
      {
        selector: 'node[type="band"]',
        style: {
          'shape': 'ellipse',
          'background-color': '#2E86AB',
          'label': 'data(id)',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': 11,
          'text-wrap': 'wrap',
          'text-max-width': 100,
          'width': 'label',
          'height': 'label',
          'padding': '6px',
        }
      },
      {
        selector: 'node[type="member"]',
        style: {
          'shape': 'rectangle',
          'background-color': '#E67E22',
          'label': 'data(id)',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': 9,
          'text-wrap': 'wrap',
          'text-max-width': 100,
          'width': 'label',
          'height': 'label',
          'padding': '6px',
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 1.5,
          'line-color': '#CCCCCC',
          'target-arrow-color': '#CCCCCC',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': 8,
          'color': '#333',
          'text-rotation': 'autorotate',
        }
      },
      {
        selector: '.highlight',
        style: {
          'background-color': '#FFD700',
          'border-width': 3,
          'border-color': '#FFD700',
        }
      },
      {
        selector: '.faded',
        style: {
          'opacity': 0.15,
          'text-opacity': 0.1,
        }
      }
    ],
    layout: {
      name: 'cose',
      idealEdgeLength: 100,
      nodeOverlap: 20,
      refresh: 20,
      fit: true,
      padding: 30,
      randomize: true,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      edgeElasticity: 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      animate: false,
    },
    boxSelectionEnabled: false,
    autounselectify: true
  });

  const infoPanel = document.getElementById('infoPanel');
  let currentTooltip = null;

  function removeTooltip() {
    if (currentTooltip) {
      currentTooltip.remove();
      currentTooltip = null;
    }
  }

  cy.on('mouseover', 'node', function(evt) {
    const node = evt.target;
    const pos = node.renderedPosition();
    removeTooltip();
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = node.data('id') + ' (' + node.data('years') + ')';
    const rect = cy.container().getBoundingClientRect();
    tooltip.style.left = (rect.left + pos.x + 10) + 'px';
    tooltip.style.top = (rect.top + pos.y + 10) + 'px';
    tooltip.style.position = 'fixed';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = 9999;
    document.body.appendChild(tooltip);
    currentTooltip = tooltip;
  });

  cy.on('mouseout', 'node', function(evt) {
    removeTooltip();
  });

  // Highlight and info panel on node click
  // Multi-cluster color coding
  let clusters = [];

  function getRandomColor() {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}, 70%, 75%)`;
  }

  // Add Clear All button
  let clearBtn = document.getElementById('clearAllBtn');
  if (!clearBtn) {
    clearBtn = document.createElement('button');
    clearBtn.id = 'clearAllBtn';
    clearBtn.textContent = 'Clear All';
    clearBtn.style.position = 'absolute';
    clearBtn.style.top = '10px';
    clearBtn.style.right = '10px';
    clearBtn.style.zIndex = 1001;
    clearBtn.style.padding = '6px 16px';
    clearBtn.style.background = '#fff';
    clearBtn.style.border = '1px solid #aaa';
    clearBtn.style.borderRadius = '6px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.fontWeight = 'bold';
    clearBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    clearBtn.style.display = 'none';
    document.body.appendChild(clearBtn);
  }

  // Add Export as PNG button
  let exportBtn = document.getElementById('exportPngBtn');
  if (!exportBtn) {
    exportBtn = document.createElement('button');
    exportBtn.id = 'exportPngBtn';
    exportBtn.textContent = 'Export as PNG';
    exportBtn.style.position = 'absolute';
    exportBtn.style.top = '10px';
    exportBtn.style.right = '110px';
    exportBtn.style.zIndex = 1001;
    exportBtn.style.padding = '6px 16px';
    exportBtn.style.background = '#fff';
    exportBtn.style.border = '1px solid #aaa';
    exportBtn.style.borderRadius = '6px';
    exportBtn.style.cursor = 'pointer';
    exportBtn.style.fontWeight = 'bold';
    exportBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    document.body.appendChild(exportBtn);
  }

  // --- Fuzzy Search & Results Dropdown ---
  const searchInput = document.getElementById('searchInput');
  let searchDropdown = document.getElementById('searchDropdown');
  if (!searchDropdown) {
    searchDropdown = document.createElement('div');
    searchDropdown.id = 'searchDropdown';
    searchDropdown.style.position = 'absolute';
    searchDropdown.style.top = '36px';
    searchDropdown.style.left = '12px';
    searchDropdown.style.zIndex = 1002;
    searchDropdown.style.background = '#fff';
    searchDropdown.style.border = '1px solid #aaa';
    searchDropdown.style.borderRadius = '4px';
    searchDropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
    searchDropdown.style.display = 'none';
    searchDropdown.style.maxHeight = '180px';
    searchDropdown.style.overflowY = 'auto';
    searchDropdown.style.minWidth = '220px';
    document.body.appendChild(searchDropdown);
  }

  function fuzzyMatch(str, query) {
    if (!query) return false;
    return str.toLowerCase().includes(query.toLowerCase());
  }

  function clearSearchHighlight() {
    cy.elements().removeClass('search-highlight search-faded');
    searchDropdown.style.display = 'none';
  }

  searchInput.addEventListener('input', function() {
    const query = searchInput.value.trim();
    if (!query) {
      clearSearchHighlight();
      return;
    }
    const matches = cy.nodes().filter(n => fuzzyMatch(n.data('id'), query));
    cy.elements().removeClass('search-highlight search-faded');
    if (matches.length === 0) {
      searchDropdown.style.display = 'none';
      cy.elements().addClass('search-faded');
      return;
    }
    matches.addClass('search-highlight');
    cy.nodes().difference(matches).addClass('search-faded');
    cy.edges().addClass('search-faded');
    // Populate dropdown
    searchDropdown.innerHTML = '';
    matches.forEach(n => {
      const item = document.createElement('div');
      item.textContent = n.data('id');
      item.style.padding = '6px 10px';
      item.style.cursor = 'pointer';
      item.style.borderBottom = '1px solid #eee';
      item.onmouseenter = () => { item.style.background = '#e6f7ff'; };
      item.onmouseleave = () => { item.style.background = '#fff'; };
      item.onclick = () => {
        cy.animate({ center: { eles: n }, zoom: 1.3 }, { duration: 500 });
        cy.elements().removeClass('search-highlight search-faded');
        n.addClass('search-highlight');
        cy.nodes().difference(n).addClass('search-faded');
        cy.edges().addClass('search-faded');
        // Show info in sidebar if available
        if (typeof showNodeInfo === 'function') showNodeInfo(n);
        searchDropdown.style.display = 'none';
      };
      searchDropdown.appendChild(item);
    });
    searchDropdown.style.display = 'block';
    // Optionally auto-zoom to first match
    cy.animate({ center: { eles: matches[0] }, zoom: 1.1 }, { duration: 400 });
  });

  searchInput.addEventListener('blur', function() {
    setTimeout(() => { searchDropdown.style.display = 'none'; }, 200);
  });

  // Add styles for search highlight/fade
  cy.style()
    .selector('.search-highlight')
    .style({
      'border-width': 6,
      'border-color': '#36cfc9',
      'background-color': '#36cfc9',
      'color': '#fff',
      'z-index': 9999
    })
    .selector('.search-faded')
    .style({
      'opacity': 0.1,
      'text-opacity': 0.1
    })
    .update();

  // Add Show Only Highlighted toggle
  let showOnlyBtn = document.getElementById('showOnlyHighlightedBtn');
  if (!showOnlyBtn) {
    showOnlyBtn = document.createElement('button');
    showOnlyBtn.id = 'showOnlyHighlightedBtn';
    showOnlyBtn.textContent = 'Show Only Highlighted';
    showOnlyBtn.style.position = 'absolute';
    showOnlyBtn.style.top = '10px';
    showOnlyBtn.style.right = '370px';
    showOnlyBtn.style.zIndex = 1001;
    showOnlyBtn.style.padding = '6px 16px';
    showOnlyBtn.style.background = '#fff';
    showOnlyBtn.style.border = '1px solid #aaa';
    showOnlyBtn.style.borderRadius = '6px';
    showOnlyBtn.style.cursor = 'pointer';
    showOnlyBtn.style.fontWeight = 'bold';
    showOnlyBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    document.body.appendChild(showOnlyBtn);
  }

  exportBtn.onclick = function() {
    const pngData = cy.png({scale: 2, full: false, bg: '#fff'});
    const link = document.createElement('a');
    link.href = pngData;
    link.download = 'punx-graph.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Path Mode logic
  let pathMode = false;
  let customPaths = [];
  let pathColor = null;
  let pathSelection = [];




  // Show Only Highlighted logic
  let showOnly = false;
  showOnlyBtn.onclick = function() {
    showOnly = !showOnly;
    showOnlyBtn.style.background = showOnly ? '#ffe58f' : '#fff';
    if (showOnly) {
      // Hide all elements not in any cluster or path
      let highlightedIds = new Set();
      clusters.forEach(c => c.nodes.forEach(ele => highlightedIds.add(ele.id())));
      customPaths.forEach(p => p.elements.forEach(ele => highlightedIds.add(ele.id())));
      cy.elements().forEach(ele => {
        if (!highlightedIds.has(ele.id())) ele.hide();
      });
    } else {
      cy.elements().forEach(ele => ele.show());
    }
  };

  // Restore Clear All to only clear clusters
  clearBtn.onclick = function() {
    clusters.forEach(({nodes, color}) => {
      nodes.forEach(ele => {
        if (ele.isNode()) ele.style('background-color', '');
        if (ele.isEdge()) ele.style('line-color', '');
        ele.removeClass('cluster-color highlight faded');
      });
    });
    clusters = [];
    nodeClusters = {};
    focusedClusterIdx = null;
    clearBtn.style.display = 'none';
    cy.elements().removeClass('faded');
    cy.elements().forEach(ele => ele.show());
    showOnlyBtn.style.background = '#fff';
    showOnly = false;
  };



  // Track cluster memberships per node
  let nodeClusters = {}; // nodeId -> array of {color, clusterIdx}
  let focusedClusterIdx = null;

  // Right-click (contextmenu) to cycle cluster color or unhighlight node
  cy.on('cxttap', 'node', function(evt) {
    evt.preventDefault && evt.preventDefault();
    const node = evt.target;
    const clustersForNode = nodeClusters[node.id()];
    if (!clustersForNode || clustersForNode.length === 0) return;
    // Find current color index
    let currentIdx = clustersForNode.findIndex(c => node.style('background-color') === c.color);
    // If not found, start at 0
    if (currentIdx === -1) currentIdx = 0;
    else currentIdx = (currentIdx + 1) % (clustersForNode.length + 1);
    // If cycled past last color, unhighlight
    if (currentIdx === clustersForNode.length) {
      node.style('background-color', '');
      node.removeClass('cluster-color');
      // Remove from all clusters
      clustersForNode.forEach(c => {
        const idx = clusters[c.clusterIdx].nodes.findIndex(n => n.id() === node.id());
        if (idx !== -1) clusters[c.clusterIdx].nodes.splice(idx, 1);
      });
      nodeClusters[node.id()] = [];
    } else {
      // Set to next cluster color
      node.style('background-color', clustersForNode[currentIdx].color);
      node.addClass('cluster-color');
    }
  });

  function updateNodeColors() {
    // For each node, set color to the color of the most recently focused cluster it belongs to
    cy.nodes().forEach(node => {
      const id = node.id();
      const memberships = nodeClusters[id] || [];
      if (memberships.length === 0) {
        node.style('background-color', '');
        node.removeClass('cluster-color highlight');
      } else {
        // Find the most recent (highest clusterIdx, i.e., last in clusters) focused cluster
        let chosen = memberships.find(m => m.clusterIdx === focusedClusterIdx);
        if (!chosen) chosen = memberships[memberships.length-1];
        node.style('background-color', clusters[chosen.clusterIdx].color);
        node.addClass('cluster-color highlight');
      }
    });
    // For edges: if both ends are in the same focused cluster, color the edge
    cy.edges().forEach(edge => {
      let src = edge.source().id(), tgt = edge.target().id();
      let srcM = nodeClusters[src] || [], tgtM = nodeClusters[tgt] || [];
      let common = srcM.map(m => m.clusterIdx).filter(idx => tgtM.some(tm => tm.clusterIdx === idx));
      let color = null;
      if (common.length > 0) {
        // Prefer focused cluster
        color = clusters[focusedClusterIdx] && common.includes(focusedClusterIdx)
          ? clusters[focusedClusterIdx].color
          : clusters[common[common.length-1]].color;
        edge.style('line-color', color);
        edge.addClass('cluster-color highlight');
      } else {
        edge.style('line-color', '');
        edge.removeClass('cluster-color highlight');
      }
    });
  }

  cy.on('tap', 'node', function(evt) {
    const node = evt.target;
    const neighborhood = node.closedNeighborhood();
    // Always create a new cluster for this neighborhood
    let color = getRandomColor();
    let clusterIdx = clusters.length;
    clusters.push({nodes: neighborhood, color});
    focusedClusterIdx = clusterIdx;
    // Update nodeClusters
    neighborhood.forEach(ele => {
      if (ele.isNode()) {
        if (!nodeClusters[ele.id()]) nodeClusters[ele.id()] = [];
        nodeClusters[ele.id()].push({color, clusterIdx});
      }
    });
    // Edges: add to cluster if both ends are in cluster
    neighborhood.forEach(ele => {
      if (ele.isEdge()) {
        let src = ele.source().id(), tgt = ele.target().id();
        if ((nodeClusters[src]||[]).some(m=>m.clusterIdx===clusterIdx) && (nodeClusters[tgt]||[]).some(m=>m.clusterIdx===clusterIdx)) {
          // ok
        }
      }
    });
    cy.elements().difference(neighborhood).addClass('faded');
    updateNodeColors();
    clearBtn.style.display = 'block';
    cy.animate({ center: { eles: neighborhood }, zoom: 1.3 }, { duration: 500 });
    // Info panel
    const data = node.data();
    let html = `<h3>${data.id}</h3>`;
    html += `<p><strong>Type:</strong> ${data.type}</p>`;
    html += `<p><strong>Years active:</strong> ${data.years}</p>`;
    if (data.type === 'band') {
      // List members
      const members = edges.filter(e => e.data.target === data.id);
      if (members.length > 0) {
        html += '<p><strong>Members:</strong></p><ul>';
        members.forEach(e => {
          html += `<li>${e.data.source} – ${e.data.label}</li>`;
        });
        html += '</ul>';
      }
    } else {
      // List bands
      const bands = edges.filter(e => e.data.source === data.id);
      if (bands.length > 0) {
        html += '<p><strong>Bands:</strong></p><ul>';
        bands.forEach(e => {
          html += `<li>${e.data.target} – ${e.data.label}</li>`;
        });
        html += '</ul>';
      }
    }
    infoPanel.innerHTML = html;
    infoPanel.style.display = 'block';
  });

  // When clicking a node in multiple clusters, focus its most recent cluster
  cy.on('tap', 'node', function(evt) {
    const node = evt.target;
    const id = node.id();
    if ((nodeClusters[id]||[]).length > 1) {
      // Focus the most recent cluster for this node
      focusedClusterIdx = nodeClusters[id][nodeClusters[id].length-1].clusterIdx;
      updateNodeColors();
    }
  });

  // Ctrl+drag to move cluster (multi-cluster mode)
  let isDraggingCluster = false;
  let dragStartPos = null;
  let clusterNodes = [];
  let dragClusterColor = null;

  cy.on('grab', 'node', function(evt) {
    if (window.event && window.event.ctrlKey) {
      // Find the color of the cluster this node belongs to
      let nodeColor = evt.target.style('background-color');
      // Find all nodes in this cluster (same color and class)
      clusterNodes = cy.nodes().filter(n => n.hasClass('cluster-color') && n.style('background-color') === nodeColor && n.id() !== evt.target.id());
      if (clusterNodes.length > 0) {
        isDraggingCluster = true;
        dragStartPos = evt.target.position();
        dragClusterColor = nodeColor;
        clusterNodes.forEach(n => {
          n.scratch('_offset', {
            x: n.position('x') - dragStartPos.x,
            y: n.position('y') - dragStartPos.y
          });
        });
      }
    }
  });

  cy.on('drag', 'node', function(evt) {
    if (isDraggingCluster && dragStartPos) {
      const node = evt.target;
      const newPos = node.position();
      clusterNodes.forEach(n => {
        const offset = n.scratch('_offset');
        n.position({ x: newPos.x + offset.x, y: newPos.y + offset.y });
      });
    }
  });

  cy.on('free', 'node', function(evt) {
    if (isDraggingCluster) {
      isDraggingCluster = false;
      dragStartPos = null;
      clusterNodes.forEach(n => n.removeScratch('_offset'));
      clusterNodes = [];
      dragClusterColor = null;
    }
  });


  // Hide info panel and clear highlights on background click
  cy.on('tap', function(evt) {
    if (evt.target === cy) {
      infoPanel.style.display = 'none';
      cy.elements().removeClass('highlight faded');
    }
  });


}


// Export for use in HTML
window.initializeGraph = initializeGraph;
