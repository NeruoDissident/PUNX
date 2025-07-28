(function(global){
  // showOnlyControl.js
  // Handles the 'Show Only Highlighted' button functionality

  let showOnly = false;

  function createControlPanel() {
    let container = document.getElementById('controlPanel');
    if (!container) {
      container = document.createElement('div');
      container.id = 'controlPanel';
      container.className = 'panel';
      container.style.top = '60px';
      container.style.left = '10px';
      const header = document.createElement('div');
      header.className = 'panel-header';
      header.innerHTML = 'Controls';
      container.appendChild(header);
      document.body.appendChild(container);
    }
    return container;
  }

  function addShowOnlyControls(container) {
    const controlGroup = document.createElement('div');
    controlGroup.className = 'control-group';
    controlGroup.innerHTML = `
      <button id="showOnlyBtn" class="btn btn-blue btn-block">Show Only Clusters</button>
      <button id="clearHighlightsBtn" class="btn btn-orange btn-block">Clear Highlights</button>
      <button id="clearClustersBtn" class="btn btn-red btn-block">Clear All Clusters</button>
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
          cy.nodes().forEach(n => { if (!keep.contains(n)) n.hide(); });
          cy.edges().forEach(edge => { if (!edge.source().visible() || !edge.target().visible()) edge.hide(); });
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
        cy.elements().removeClass('highlight faded');
        cy.elements().style({ 'opacity': '', 'text-opacity': '' });

        cy.nodes().forEach(node => { if (!node.hasClass('cluster-color')) node.style('background-color', ''); });
        cy.edges().forEach(edge => { if (!edge.hasClass('cluster-color')) edge.style('line-color', ''); });

        if (showOnly) {
          cy.nodes().forEach(n => n.show());
          cy.edges().forEach(e => e.show());
          showOnly = false;
          showBtn.textContent = 'Show Only Clusters';
        }

        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) infoPanel.style.display = 'none';

        const clusterPanel = document.getElementById('clusterPanel');
        if (clusterPanel) clusterPanel.style.display = 'none';

        console.log('Cleared highlights and temporary selections');
      };
    }

    if (clearClustersBtn) {
      clearClustersBtn.onclick = function() {
        cy.elements().removeClass('highlight faded cluster-color');
        cy.elements().style({
          'background-color': '',
          'line-color': '',
          'opacity': '',
          'text-opacity': ''
        });

        if (global.resetAllClusters) global.resetAllClusters();

        cy.nodes().forEach(n => n.show());
        cy.edges().forEach(e => e.show());

        showOnly = false;
        showBtn.textContent = 'Show Only Clusters';

        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) infoPanel.style.display = 'none';
        const clusterPanel = document.getElementById('clusterPanel');
        if (clusterPanel) clusterPanel.style.display = 'none';

        console.log('Cleared all clusters and reset view');
      };
    }
  }

  function updateShowOnlyUI() {
    const showBtn = document.getElementById('showOnlyBtn');
    if (showBtn) {
      showBtn.textContent = showOnly ? 'Show All' : 'Show Only Clusters';
    }
  }

  global.showOnlyControl = {
    update: updateShowOnlyUI,
    init: initShowOnlyControl
  };
})(window);

