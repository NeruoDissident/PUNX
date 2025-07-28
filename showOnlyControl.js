// showOnlyControl.js
// Handles the 'Show Only Highlighted' button functionality

let showOnly = false;

// showOnlyControl.js

// This function creates the main control panel and can be extended by other scripts.
function createControlPanel() {
  let container = document.getElementById('controlPanel');
  if (!container) {
    container = document.createElement('div');
    container.id = 'controlPanel';
    container.style.position = 'absolute';
    container.style.top = '60px';
    container.style.left = '10px';
    container.style.zIndex = 1005;
    container.style.background = 'rgba(255,255,255,0.95)';
    container.style.padding = '10px';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)';
    container.style.border = '1px solid #ddd';
    container.style.minWidth = '160px';
    document.body.appendChild(container);

    // Add a header to the main panel
    const header = document.createElement('div');
    header.innerHTML = 'Controls';
    header.style.fontSize = '12px';
    header.style.fontWeight = 'bold';
    header.style.color = '#333';
    header.style.marginBottom = '8px';
    header.style.textAlign = 'center';
    header.style.borderBottom = '1px solid #eee';
    header.style.paddingBottom = '5px';
    container.appendChild(header);
  }
  return container;
}

// This function adds the specific controls for this module to the main panel
function addShowOnlyControls(container) {
  const controlGroup = document.createElement('div');
  controlGroup.style.display = 'flex';
  controlGroup.style.flexDirection = 'column';
  controlGroup.style.gap = '6px';

  controlGroup.innerHTML = `
    <button id="showOnlyBtn" style="padding: 7px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px; white-space: nowrap; width: 100%;">
      Show Only Clusters
    </button>
    <button id="clearHighlightsBtn" style="padding: 7px 12px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px; white-space: nowrap; width: 100%;">
      Clear Highlights
    </button>
    <button id="clearClustersBtn" style="padding: 7px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px; white-space: nowrap; width: 100%;">
      Clear All Clusters
    </button>
  `;
  container.appendChild(controlGroup);
}

function createShowOnlyUI() {
  const container = createControlPanel();
  addShowOnlyControls(container);
  return container;
}

function initShowOnlyControl(cy) {
  createShowOnlyUI();
  
  // Setup event handlers
  const showBtn = document.getElementById('showOnlyBtn');
  const clearBtn = document.getElementById('clearHighlightsBtn');
  const clearClustersBtn = document.getElementById('clearClustersBtn');
  
  if (showBtn) {
    showBtn.onclick = function() {
      showOnly = !showOnly;
      if (showOnly) {
        const highlighted = cy.nodes('.highlight');
        const clustered = cy.nodes('.cluster-color');
        const keep = highlighted.union(clustered);
        cy.nodes().forEach(n => {
          if (!keep.contains(n)) n.hide();
        });
        cy.edges().forEach(edge => {
          if (!edge.source().visible() || !edge.target().visible()) edge.hide();
        });
        showBtn.textContent = 'Show All';
      } else {
        cy.nodes().forEach(n => n.show());
        cy.edges().forEach(e => e.show());
        showBtn.textContent = 'Show Only Clusters';
      }
    };
  }
  
  if (clearBtn) {
    clearBtn.onclick = function() {
      // Clear highlights but keep clusters
      cy.elements().removeClass('highlight faded');
      cy.elements().style({ 'opacity': '', 'text-opacity': '' });
      
      // Reset any temporary highlighting styles
      cy.nodes().forEach(node => {
        if (!node.hasClass('cluster-color')) {
          node.style('background-color', '');
        }
      });
      cy.edges().forEach(edge => {
        if (!edge.hasClass('cluster-color')) {
          edge.style('line-color', '');
        }
      });
      
      // Show all nodes if in show-only mode
      if (showOnly) {
        cy.nodes().forEach(n => n.show());
        cy.edges().forEach(e => e.show());
        showOnly = false;
        showBtn.textContent = 'Show Only Clusters';
      }
      
      // Hide info panel
      const infoPanel = document.getElementById('infoPanel');
      if (infoPanel) infoPanel.style.display = 'none';
      
      // Hide cluster panel if open
      const clusterPanel = document.getElementById('clusterPanel');
      if (clusterPanel) clusterPanel.style.display = 'none';
      
      console.log('Cleared highlights and temporary selections');
    };
  }
  
  if (clearClustersBtn) {
    clearClustersBtn.onclick = function() {
      // Clear all clusters and reset everything
      cy.elements().removeClass('highlight faded cluster-color');
      cy.elements().style({ 
        'background-color': '', 
        'line-color': '', 
        'opacity': '', 
        'text-opacity': '' 
      });
      
      // Reset all cluster data using global function
      if (window.resetAllClusters) {
        window.resetAllClusters();
      }
      
      // Show all nodes
      cy.nodes().forEach(n => n.show());
      cy.edges().forEach(e => e.show());
      
      // Reset show only state
      showOnly = false;
      showBtn.textContent = 'Show Only Clusters';
      
      // Hide panels
      const infoPanel = document.getElementById('infoPanel');
      if (infoPanel) infoPanel.style.display = 'none';
      
      const clusterPanel = document.getElementById('clusterPanel');
      if (clusterPanel) clusterPanel.style.display = 'none';
      
      console.log('Cleared all clusters and reset view');
    };
  }
}

function updateShowOnlyUI(cy) {
  const showBtn = document.getElementById('showOnlyBtn');
  if (showBtn) {
    if (showOnly) {
      showBtn.textContent = 'Show All';
    } else {
      showBtn.textContent = 'Show Only Clusters';
    }
  }
}

window.showOnlyControl = {
  update: updateShowOnlyUI,
  init: initShowOnlyControl
};
