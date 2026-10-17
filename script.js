
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const toast = $("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Mobile sidebar
$("#menuBtn").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

$$(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    $$(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    $("#pageName").textContent = link.dataset.page;
    $("#sidebar").classList.remove("open");

    if (link.dataset.page === "AI Assistant") {
      $("#chatInput").focus();
    } else if (link.dataset.page === "Projects") {
      $("#projects").scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (link.dataset.page === "Analytics") {
      $("#analytics").scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (link.dataset.page === "Dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showToast(link.dataset.page + " section selected. Demo interface.");
    }
  });
});

// Light/dark mode
$("#themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  $("#themeBtn").textContent = isLight ? "☾" : "☼";

  if (window.usageChart) {
    window.usageChart.options.scales.x.ticks.color =
      isLight ? "#68758e" : "#8e9bb5";
    window.usageChart.options.scales.y.ticks.color =
      isLight ? "#68758e" : "#8e9bb5";
    window.usageChart.options.scales.x.grid.color =
      isLight ? "#e6eaf2" : "#202d43";
    window.usageChart.options.scales.y.grid.color =
      isLight ? "#e6eaf2" : "#202d43";
    window.usageChart.update();
  }
});

// Search projects
$("#searchInput").addEventListener("input", event => {
  const query = event.target.value.trim().toLowerCase();
  let visible = 0;

  $$(".project-row").forEach(row => {
    const matches = row.textContent.toLowerCase().includes(query) ||
      (row.dataset.search || "").includes(query);
    row.hidden = !matches;
    if (matches) visible++;
  });

  if (query && visible === 0) {
    showToast("No matching projects found.");
  }
});

// Analytics chart
const chartCanvas = $("#usageChart");

if (window.Chart && chartCanvas) {
  const chartContext = chartCanvas.getContext("2d");
  const gradient = chartContext.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, "rgba(142, 103, 255, 0.35)");
  gradient.addColorStop(1, "rgba(142, 103, 255, 0.01)");

  const chartLabels = {
    7: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    14: ["Day 1", "Day 3", "Day 5", "Day 7", "Day 9", "Day 11", "Day 14"],
    30: ["Week 1", "Week 2", "Week 3", "Week 4", "Today"]
  };

  const chartValues = {
    7: [320, 260, 390, 510, 570, 760, 980],
    14: [240, 360, 310, 500, 460, 720, 880],
    30: [380, 520, 460, 790, 980]
  };

  window.usageChart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: chartLabels[7],
      datasets: [{
        label: "AI Requests",
        data: chartValues[7],
        fill: true,
        backgroundColor: gradient,
        borderColor: "#9471ff",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: "#c4adff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#192640",
          titleColor: "#fff",
          bodyColor: "#c9d5eb",
          padding: 12,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { color: "#202d43" },
          border: { display: false },
          ticks: { color: "#8e9bb5", font: { size: 10 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: "#202d43" },
          border: { display: false },
          ticks: { color: "#8e9bb5", maxTicksLimit: 5, font: { size: 10 } }
        }
      }
    }
  });

  $("#chartRange").addEventListener("change", event => {
    const range = event.target.value;
    window.usageChart.data.labels = chartLabels[range];
    window.usageChart.data.datasets[0].data = chartValues[range];
    window.usageChart.update();
  });
} else {
  chartCanvas.parentElement.innerHTML =
    '<p class="muted">Chart unavailable. Check your internet connection to load Chart.js.</p>';
}

// Create projects
const projectDialog = $("#projectDialog");

$("#newProjectBtn").addEventListener("click", () => {
  $("#projectForm").reset();
  projectDialog.showModal();
  $("#projectName").focus();
});

$("#projectForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#projectName").value.trim();
  const description = $("#projectDescription").value.trim();

  if (!name) return;

  const row = document.createElement("article");
  row.className = "project-row";
  row.dataset.search = (name + " " + description).toLowerCase();

  const icon = document.createElement("span");
  icon.className = "project-icon purple";
  icon.textContent = "✧";

  const info = document.createElement("div");
  info.className = "project-info";

  const title = document.createElement("strong");
  title.textContent = name;

  const detail = document.createElement("small");
  detail.textContent = description || "New AI project";

  info.append(title, detail);

  const status = document.createElement("span");
  status.className = "status active-status";
  status.textContent = "Active";

  const time = document.createElement("small");
  time.className = "project-time";
  time.textContent = "Just now";

  row.append(icon, info, status, time);
  $("#projectList").prepend(row);

  const current = Number($("#projectsStat").textContent);
  $("#projectsStat").textContent = current + 1;

  projectDialog.close();
  showToast("Project created in this demo!");
});

// Filter and view all projects
$("#viewAllBtn").addEventListener("click", () => {
  $("#searchInput").value = "";
  $$(".project-row").forEach(row => row.hidden = false);
  $("#projects").scrollIntoView({ behavior: "smooth", block: "center" });
  showToast("Showing all projects.");
});

$("#allToolsBtn").addEventListener("click", () => {
  showToast("Explore AI Chat, AI Writer, Image Studio and Data Analyst.");
});

$("#upgradeBtn").addEventListener("click", () => {
  showToast("Pro plan preview — connect a billing service to enable upgrades.");
});

$("#notificationBtn").addEventListener("click", () => {
  showToast("You're all caught up!");
});

// Project menu buttons
$("#projectList").addEventListener("click", event => {
  const button = event.target.closest(".more-btn");
  if (!button) return;

  const row = button.closest(".project-row");
  const name = row.querySelector(".project-info strong").textContent;

  if (confirm(`Delete "${name}" from this demo dashboard?`)) {
    row.remove();
    $("#projectsStat").textContent =
      Math.max(0, Number($("#projectsStat").textContent) - 1);
    showToast("Project removed.");
  }
});

// Chat UI: this is a front-end demo, not a connected AI service.
function addMessage(text, sender) {
  const wrapper = document.createElement("div");
  wrapper.className = "message " +
    (sender === "user" ? "user-message" : "assistant-message");

  if (sender !== "user") {
    const avatar = document.createElement("span");
    avatar.className = "chat-avatar";
    avatar.textContent = "✧";
    wrapper.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  bubble.appendChild(paragraph);
  wrapper.appendChild(bubble);

  const chat = $("#chatMessages");
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

function demoReply(prompt) {
  const text = prompt.toLowerCase();

  if (text.includes("idea") || text.includes("startup")) {
    return "Here are three ideas to explore:\n1. An AI study planner that personalizes daily learning.\n2. A small-business content assistant.\n3. A dashboard that turns reports into simple insights.\n\nWhich one would you like to develop?";
  }

  if (text.includes("write") || text.includes("content") ||
      text.includes("blog") || text.includes("description")) {
    return "Let's create something great! Start with a clear headline, explain the main benefit, and finish with one simple call to action. Tell me your topic and target audience to build a more specific draft.";
  }

  if (text.includes("data") || text.includes("analy")) {
    return "I can help you plan an analysis. Start with your dataset, decide which question you want to answer, check for missing values, and compare the important metrics. This demo cannot inspect files or run real data analysis yet.";
  }

  if (text.includes("week") || text.includes("plan") ||
      text.includes("productivity")) {
    return "Try this simple plan:\n• Monday: choose your top three goals.\n• Tuesday–Wednesday: focus on your main project.\n• Thursday: review progress and resolve blockers.\n• Friday: summarize results and plan next week.\n\nAdjust it to fit your schedule.";
  }

  if (text.includes("project")) {
    return "Let's break your project into four steps: define the goal, choose the features, build a first version, and test it with real users. You can also use the New project button to add it to this dashboard.";
  }

  return "Thanks for your message! I'm a demo assistant, so I can show sample responses but I am not connected to a real AI model yet. To get real AI answers, connect a backend API and keep your API key on the server.";
}

function sendChatMessage(text) {
  const prompt = text.trim();
  if (!prompt) return;

  addMessage(prompt, "user");
  $("#chatInput").value = "";

  const chat = $("#chatMessages");
  const typing = document.createElement("div");
  typing.className = "message assistant-message";

  const avatar = document.createElement("span");
  avatar.className = "chat-avatar";
  avatar.textContent = "✧";

  const bubble = document.createElement("div");
  bubble.textContent = "Thinking...";
  typing.append(avatar, bubble);
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  setTimeout(() => {
    typing.remove();
    addMessage(demoReply(prompt), "assistant");
  }, 650);
}

$("#chatForm").addEventListener("submit", event => {
  event.preventDefault();
  sendChatMessage($("#chatInput").value);
});

$("#chatInput").addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    $("#chatForm").requestSubmit();
  }
});

// Clickable prompt suggestions and quick actions
document.addEventListener("click", event => {
  const promptButton = event.target.closest("[data-prompt]");
  if (!promptButton) return;

  sendChatMessage(promptButton.dataset.prompt);
  $("#chatInput").focus();
});

$("#clearChatBtn").addEventListener("click", () => {
  $("#chatMessages").replaceChildren();

  const welcome = document.createElement("div");
  welcome.className = "message assistant-message";
  const avatar = document.createElement("span");
  avatar.className = "chat-avatar";
  avatar.textContent = "✧";

  const bubble = document.createElement("div");
  const message = document.createElement("p");
  message.textContent = "Chat cleared! What would you like to work on?";
  bubble.appendChild(message);
  welcome.append(avatar, bubble);
  $("#chatMessages").appendChild(welcome);
  showToast("Conversation cleared.");
});
