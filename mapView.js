(function(){
  let map, markerLayer, edgeLayer, visible = false;

  function createMapContainer(){
    let div = document.getElementById('map');
    if(!div){
      div = document.createElement('div');
      div.id = 'map';
      div.style.width = '100vw';
      div.style.height = '100vh';
      div.style.position = 'absolute';
      div.style.top = '0';
      div.style.left = '0';
      div.style.display = 'none';
      document.body.appendChild(div);
    }
    return div;
  }

  function createToggleButton(){
    let btn = document.getElementById('toggleMapBtn');
    if(!btn){
      btn = document.createElement('button');
      btn.id = 'toggleMapBtn';
      btn.textContent = 'Map View';
      btn.style.position = 'absolute';
      btn.style.top = '10px';
      btn.style.right = '210px';
      btn.style.zIndex = 1001;
      btn.style.padding = '6px 16px';
      btn.style.background = '#fff';
      btn.style.border = '1px solid #aaa';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.style.fontWeight = 'bold';
      btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      document.body.appendChild(btn);
    }
    btn.onclick = toggleView;
  }

  function init(nodes, edges){
    try {
      const container = createMapContainer();
      
      // Check if Leaflet is available
      if (typeof L === 'undefined') {
        console.error('Leaflet is not loaded');
        return;
      }
      
      map = L.map(container).setView([20,0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      markerLayer = L.layerGroup().addTo(map);
      edgeLayer = L.layerGroup().addTo(map);

      const lookup = {};
      if (nodes && Array.isArray(nodes)) {
        nodes.forEach(n => {
          if (n && n.data) {
            lookup[n.data.id] = n.data;
            if(typeof n.data.lat === 'number' && typeof n.data.lon === 'number'){
              const marker = L.circleMarker([n.data.lat, n.data.lon], {radius:5, color:'#3388ff', fillOpacity:0.8});
              marker.bindPopup(n.data.id);
              markerLayer.addLayer(marker);
            }
          }
        });
      }

      if (edges && Array.isArray(edges)) {
        edges.forEach(e => {
          if (e && e.data) {
            const s = lookup[e.data.source];
            const t = lookup[e.data.target];
            if(s && t && s.lat != null && t.lat != null){
              L.polyline([[s.lat, s.lon],[t.lat, t.lon]], {color:'#666', weight:1}).addTo(edgeLayer);
            }
          }
        });
      }

      createToggleButton();
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  function toggleView(){
    try {
      visible = !visible;
      const mapDiv = document.getElementById('map');
      const cyDiv = document.getElementById('cy');
      if(mapDiv && cyDiv){
        mapDiv.style.display = visible ? 'block' : 'none';
        cyDiv.style.display = visible ? 'none' : 'block';
        if(visible && map){ 
          setTimeout(() => {
            map.invalidateSize(); 
          }, 100);
        }
      }
      const btn = document.getElementById('toggleMapBtn');
      if(btn) btn.textContent = visible ? 'Graph View' : 'Map View';
    } catch (error) {
      console.error('Error toggling view:', error);
    }
  }

  window.mapView = { init };
})();
