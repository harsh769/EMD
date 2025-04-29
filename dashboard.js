let chart;
let dataPoints = [];
let fetchedDevices = []; // devices from API
let addedDevices = [];   // devices manually added

// Initialize dashboard components
function initializeDashboardComponents() {
  const liveConsumptionEl = document.getElementById('liveConsumption');
  const deviceList = document.getElementById('deviceList');
  const adminDeviceList = document.getElementById('adminDeviceList');

  async function fetchLiveData() {
    try {
      const res = await fetch("https://mocki.io/v1/6462f98e-d6df-433c-9b91-13fff8233c6b");
      const data = await res.json();

      fetchedDevices = data.devices; // update fetched devices

      updateAll();
    } catch (err) {
      liveConsumptionEl.textContent = "Error fetching data";
      console.error(err);
    }
  }

  function updateAll() {
    const allDevices = [...fetchedDevices, ...addedDevices];

    updateDeviceList(allDevices);
    if (localStorage.getItem('isAdmin') === 'true') {
      updateAdminDeviceList(allDevices);
    }

    const totalConsumption = allDevices.reduce((sum, device) => sum + device.usage, 0);
    updateLiveConsumption(totalConsumption);
    addDataPoint(totalConsumption);
    updateChart();
  }

  function updateLiveConsumption(total) {
    const liveConsumptionEl = document.getElementById('liveConsumption');
    liveConsumptionEl.textContent = `${total} W`;
  }

  function addDataPoint(value) {
    dataPoints.push({
      time: new Date().toLocaleTimeString(),
      value: value
    });

    if (dataPoints.length > 20) dataPoints.shift(); // limit points
  }

  function updateChart() {
    const ctx = document.getElementById('energyChart').getContext('2d');

    if (!chart) {
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dataPoints.map(dp => dp.time),
          datasets: [{
            label: 'Power (W)',
            data: dataPoints.map(dp => dp.value),
            borderColor: 'green',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
    } else {
      chart.data.labels = dataPoints.map(dp => dp.time);
      chart.data.datasets[0].data = dataPoints.map(dp => dp.value);
      chart.update();
    }
  }

  function updateDeviceList(devices) {
    const deviceList = document.getElementById('deviceList');
    deviceList.innerHTML = devices.map(device =>
      `<li>${device.name}: ${device.usage} W</li>`
    ).join('');
  }

  function updateAdminDeviceList(devices) {
    const adminDeviceList = document.getElementById('adminDeviceList');
    adminDeviceList.innerHTML = devices.map((device, index) => `
      <li class="admin-device">
        <input type="text" class="device-input" value="${device.name}" onchange="editDeviceName(${index}, this.value)">
        <input type="number" class="device-input" value="${device.usage}" onchange="editDeviceUsage(${index}, this.value)">
        <button onclick="saveDevice(${index})">Save</button>
        <button onclick="deleteDevice(${index})">Delete</button>
      </li>
    `).join('');
  }

  window.saveDevice = (index) => {
    alert(`Device ${index} updated!`);
    updateAll();
  };

  window.deleteDevice = (index) => {
    if (index >= fetchedDevices.length) {
      // Remove from addedDevices
      const addedIndex = index - fetchedDevices.length;
      addedDevices.splice(addedIndex, 1);
    } else {
      alert("Cannot delete device fetched from server.");
    }
    updateAll();
  };

  window.editDeviceName = (index, newName) => {
    if (index >= fetchedDevices.length) {
      addedDevices[index - fetchedDevices.length].name = newName;
    }
  };

  window.editDeviceUsage = (index, newUsage) => {
    if (index >= fetchedDevices.length) {
      addedDevices[index - fetchedDevices.length].usage = parseInt(newUsage);
    }
  };

  window.addNewDevice = (event) => {
    event.preventDefault();
    const deviceName = document.getElementById('newDeviceName').value.trim();
    const deviceUsage = document.getElementById('newDeviceUsage').value.trim();

    if (deviceName && deviceUsage) {
      addedDevices.push({ name: deviceName, usage: parseInt(deviceUsage) });
      alert(`New device '${deviceName}' added!`);
      document.getElementById('addDeviceForm').reset();
      updateAll();
    } else {
      alert('Please fill both name and usage.');
    }
  };

  // Initialize dashboard
  setInterval(fetchLiveData, 3000);
  fetchLiveData();
}

// Initialize dashboard from auth.js
function initDashboard() {
  initializeDashboardComponents();
}
