const chatBox = document.getElementById("chatBox");
const queryInput = document.getElementById("queryInput");
const csvFile = document.getElementById("csvFile");
const sendBtn = document.getElementById("sendBtn");
const chatContainer = document.getElementById("chatContainer");
const openBtn = document.querySelector(".openbtn");
let dark = false;
let chatHistory = [];

function openNav() {
  document.getElementById("mySidepanel").classList.add("open");
  chatContainer.classList.add("shifted");
  openBtn.classList.add("hidden");
  const gearIcon = document.querySelector(".fa-gear");
  if (gearIcon) {
    gearIcon.classList.add("gear-spin");
    setTimeout(() => gearIcon.classList.remove("gear-spin"), 600);
  }
}

function closeNav() {
  document.getElementById("mySidepanel").classList.remove("open");
  chatContainer.classList.remove("shifted");
  openBtn.classList.remove("hidden");
}

function toggleDarkMode() {
  const themeIcon = document.querySelector(".theme-icon");
  document.body.classList.toggle("dark-mode");
  dark = !dark;

  if (dark) {
    document.body.classList.remove("light-mode");
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  } else {
    document.body.classList.add("light-mode");
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  }
}

function addDevice() {
  const deviceList = document.getElementById("deviceList");
  const entry = document.createElement("div");
  entry.className = "device-entry";
  entry.innerHTML = `
    <input type="text" class="device-name" placeholder="Device Name" />
    <input type="number" class="device-energy" placeholder="Max Energy (kWh)" min="0" step="0.1" />
    <input type="number" class="device-hours" placeholder="Max Hours" min="0" step="1" />
    <button class="remove-device" onclick="removeDevice(this)"><i class="fa fa-trash"></i></button>
  `;
  deviceList.appendChild(entry);
  localStorage.setItem('deviceThresholds', JSON.stringify(getDeviceThresholds()));
}

function removeDevice(btn) {
  btn.parentElement.remove();
  localStorage.setItem('deviceThresholds', JSON.stringify(getDeviceThresholds()));
}

function getDeviceThresholds() {
  const devices = document.querySelectorAll(".device-entry");
  const thresholds = {};
  devices.forEach(device => {
    const name = device.querySelector(".device-name").value.trim();
    const energy = parseFloat(device.querySelector(".device-energy").value);
    const hours = parseInt(device.querySelector(".device-hours").value);
    if (name && !isNaN(energy) && !isNaN(hours)) {
      thresholds[name] = { max_energy: energy, max_hours: hours };
    }
  });
  return thresholds;
}

function checkInput() {
  const query = queryInput.value.trim();
  const file = csvFile.files[0];
  console.log("checkInput - Query:", query, "File:", file);
  sendBtn.disabled = !query && !file;
}

// Debounce checkInput
let debounceTimeout;
queryInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(checkInput, 300);
});
csvFile.addEventListener('change', checkInput);

function appendChat(message, isBot, alerts = [], timeOverride = null) {
  const div = document.createElement("div");
  div.className = `chat-entry ${isBot ? 'bot' : 'user'}`;
  const time = timeOverride || new Date().toLocaleTimeString();
  const sender = isBot ? "Bot" : "You";

  const msgDiv = document.createElement("div");
  const msgSpan = document.createElement("span");
  msgSpan.className = "message-content";
  msgDiv.appendChild(msgSpan);
  div.appendChild(msgDiv);

  const timeDiv = document.createElement("div");
  timeDiv.className = "time";
  timeDiv.innerText = time;
  div.appendChild(timeDiv);

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  chatHistory.push({ sender, message, time, alerts });
  if (isBot && !timeOverride) {
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-entry bot typing-indicator";
    typingDiv.innerHTML = `<span><span>.</span><span>.</span><span>.</span></span>`;
    chatBox.appendChild(typingDiv);
    setTimeout(() => {
      chatBox.removeChild(typingDiv);
      typeMessage(msgDiv.querySelector(".message-content"), message, () => {
        if (alerts.length > 0) {
          alerts.forEach(a => {
            const alertDiv = document.createElement("div");
            alertDiv.className = "alert";
            alertDiv.innerText = "[ALERT] " + a;
            div.appendChild(alertDiv);
          });
        }
      });
    }, 1000);
  } else {
    typeMessage(msgDiv.querySelector(".message-content"), message, () => {
      if (alerts.length > 0) {
        alerts.forEach(a => {
          const alertDiv = document.createElement("div");
          alertDiv.className = "alert";
          alertDiv.innerText = "[ALERT] " + a;
          div.appendChild(alertDiv);
        });
      }
    });
  }
}

function showChatHistory() {
  const historyDiv = document.createElement("div");
  historyDiv.className = "chat-entry";
  historyDiv.innerHTML = `<strong>Chat History:</strong><br>`;
  chatHistory.forEach(entry => {
    historyDiv.innerHTML += `
      <div>
        <strong>${entry.sender} (${entry.time}):</strong> ${entry.message}
        ${entry.alerts.length > 0 ? entry.alerts.map(a => `<div class="alert">[ALERT] ${a}</div>`).join("") : ""}
      </div>
    `;
  });
  chatBox.appendChild(historyDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function typeMessage(target, text, callback) {
  target.textContent = "";
  let index = 0;
  const interval = setInterval(() => {
    if (index < text.length) {
      target.textContent += text[index++];
    } else {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 20);
}

async function sendQuery() {
  console.log("sendQuery called");
  const query = queryInput.value.trim();
  const file = csvFile.files[0];
  const totalEnergy = Number(document.getElementById("totalEnergy").value);
  const deviceThresholds = getDeviceThresholds();

  if (!query && !file) {
    appendChat("[Error] Please provide a query or upload a file.", true);
    return;
  }

  if (isNaN(totalEnergy) || totalEnergy < 0) {
    appendChat("[Error] Invalid total energy value.", true);
    return;
  }

  if (query) {
    appendChat(query, false);
  } else if (file) {
    appendChat(`Uploaded CSV: ${file.name}`, false);
  }

  queryInput.value = "";
  csvFile.value = "";
  const fileNameLabel = document.getElementById('csvFileName');
  if (fileNameLabel) {
    fileNameLabel.textContent = '';
    fileNameLabel.style.display = 'none';
  }
  checkInput();

  const gearIcon = document.querySelector(".fa-gear");
  const planeIcon = document.querySelector("#sendBtn i.fa-paper-plane");
  if (gearIcon) gearIcon.classList.add("gear-loading");

  if (planeIcon) {
    planeIcon.classList.add("send-fly");
    setTimeout(() => {
      planeIcon.classList.remove("send-fly");
      planeIcon.classList.add("send-spin");
    }, 600);
  }

  const form = new FormData();
  form.append("query", query);
  if (file) form.append("file", file);
  form.append("thresholds", JSON.stringify({
    total_energy: totalEnergy,
    device_thresholds: deviceThresholds
  }));
  form.append("timestamp", new Date().toISOString());

  for (let [key, value] of form.entries()) {
    console.log(`FormData - ${key}:`, value);
  }

  try {
    const res = await fetch("http://localhost:5000/simulate", {
      method: "POST",
      body: form
    });
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (data.error) {
      appendChat(`[Error] ${data.error}`, true);
    } else {
      const deviceNames = data.devices.map(d => d.name);
      const thresholdNames = Object.keys(deviceThresholds);
      const unmatched = thresholdNames.filter(n => !deviceNames.includes(n));
      if (unmatched.length > 0) {
        appendChat(`[Warning] Thresholds set for unknown devices: ${unmatched.join(", ")}`, true);
      }
      appendChat(data.response, true, data.alerts || []);
    }
  } catch (e) {
    console.error("Fetch failed:", e);
    appendChat(`[Error] Failed to connect to backend: ${e.message}. Please check if the server is running.`, true);
  } finally {
    if(gearIcon) gearIcon.classList.remove("gear-loading");
    queryInput.classList.remove("input-pulse");
    if (planeIcon) planeIcon.classList.remove("send-spin", "send-fly");
  }
}

csvFile.addEventListener('change', function () {
  const file = csvFile.files[0];
  const fileNameLabel = document.getElementById('csvFileName');
  if (file && fileNameLabel) {
    fileNameLabel.textContent = file.name;
    fileNameLabel.style.display = 'inline-block';
  } else if (fileNameLabel) {
    fileNameLabel.textContent = '';
    fileNameLabel.style.display = 'none';
  }
  checkInput();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded - queryInput:", document.getElementById("queryInput"));
  console.log("DOMContentLoaded - csvFile:", document.getElementById("csvFile"));
  console.log("DOMContentLoaded - sendBtn:", document.getElementById("sendBtn"));

  // Load saved thresholds
  const savedThresholds = localStorage.getItem('deviceThresholds');
  if (savedThresholds) {
    const thresholds = JSON.parse(savedThresholds);
    Object.entries(thresholds).forEach(([name, { max_energy, max_hours }]) => {
      const deviceList = document.getElementById("deviceList");
      const entry = document.createElement("div");
      entry.className = "device-entry valid";
      entry.innerHTML = `
        <input type="text" class="device-name" placeholder="Device Name" value="${name}" />
        <input type="number" class="device-energy" placeholder="Max Energy (kWh)" min="0" step="0.1" value="${max_energy}" />
        <input type="number" class="device-hours" placeholder="Max Hours" min="0" step="1" value="${max_hours}" />
        <button class="remove-device" onclick="removeDevice(this)"><i class="fa fa-trash"></i></button>
      `;
      deviceList.appendChild(entry);
    });
  }

  // Validate threshold inputs
  const deviceList = document.getElementById("deviceList");
  deviceList.addEventListener('input', (e) => {
    if (e.target.classList.contains('device-name') ||
        e.target.classList.contains('device-energy') ||
        e.target.classList.contains('device-hours')) {
      const entry = e.target.closest('.device-entry');
      const name = entry.querySelector('.device-name').value.trim();
      const energy = parseFloat(entry.querySelector('.device-energy').value);
      const hours = parseInt(entry.querySelector('.device-hours').value);
      if (name && !isNaN(energy) && !isNaN(hours)) {
        entry.classList.remove('invalid');
        entry.classList.add('valid');
      } else {
        entry.classList.remove('valid');
        entry.classList.add('invalid');
      }
      localStorage.setItem('deviceThresholds', JSON.stringify(getDeviceThresholds()));
    }
  });

  // Save thresholds on remove
  deviceList.addEventListener('click', (e) => {
    if (e.target.closest('.remove-device')) {
      setTimeout(() => {
        localStorage.setItem('deviceThresholds', JSON.stringify(getDeviceThresholds()));
      }, 0);
    }
  });

  appendChat("Hi! I'm a chadbot, here to help with your energy-related queries.", true, [], "just now");
  queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        sendQuery();
      }
    }
  });

  if (document.body.classList.contains("dark-mode")) {
    document.querySelector(".theme-icon").classList.remove("fa-moon");
    document.querySelector(".theme-icon").classList.add("fa-sun");
  } else {
    document.querySelector(".theme-icon").classList.remove("fa-sun");
    document.querySelector(".theme-icon").classList.add("fa-moon");
  }
});