// script.js - Vanilla JS Logic with Premium Features

// Initialize Lucide Icons
lucide.createIcons();

// --- Authentication Logic ---
const storedPassword = localStorage.getItem('admin_password');
if (!storedPassword) {
  localStorage.setItem('admin_password', 'krishak47');
}

const loginBtn = document.getElementById('login-btn');
const loginOverlay = document.getElementById('login-overlay');
const mainApp = document.getElementById('main-app');
const loginError = document.getElementById('login-error');

function attemptLogin() {
  const user = document.getElementById('login-username').value;
  const pass = document.getElementById('login-password').value;
  const currentPass = localStorage.getItem('admin_password');
  
  if (user === 'admin' && pass === currentPass) {
    loginOverlay.classList.remove('active');
    setTimeout(() => {
      loginOverlay.style.display = 'none';
      mainApp.style.display = 'flex';
    }, 300);
  } else {
    loginError.textContent = 'Invalid username or password.';
    loginError.style.display = 'block';
  }
}

loginBtn.addEventListener('click', attemptLogin);
document.getElementById('login-password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') attemptLogin();
});

// --- Dark Mode Logic ---
const darkModeToggle = document.getElementById('dark-mode-toggle');
const isDarkMode = localStorage.getItem('meera_dark_mode') === 'true';

if (isDarkMode) {
  document.body.classList.add('dark-theme');
  darkModeToggle.checked = true;
}

darkModeToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('meera_dark_mode', 'true');
  } else {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('meera_dark_mode', 'false');
  }
});

// --- Navigation Logic ---
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class
    navBtns.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    
    // Add active class
    btn.classList.add('active');
    const targetId = btn.getAttribute('data-target');
    document.getElementById(targetId).classList.add('active');
    
    if (targetId === 'dashboard-view') {
      updateDashboard();
    }
  });
});

// --- Date Formatting ---
const dateText = document.getElementById('date-text');
const today = new Date();
const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateText.textContent = today.toLocaleDateString('en-IN', dateOptions);

document.getElementById('invoice-date').valueAsDate = new Date(); // Default today

// --- Number to Words ---
function numberToWords(num) {
  if (num === 0) return "Zero Rupees Only";
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords (n) {
      if ((n = n.toString()).length > 9) return 'overflow';
      n = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return; var str = '';
      str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
      str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
      str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
      str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
      str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
      return str;
  }
  
  let splitParts = String(num).split('.');
  let rupees = parseInt(splitParts[0], 10);
  let paise = splitParts.length > 1 ? parseInt(splitParts[1].substring(0,2).padEnd(2, '0'), 10) : 0;
  
  let wordString = "INR " + inWords(rupees).trim();
  
  if (paise > 0) {
      wordString += " and " + inWords(paise).trim() + " paise";
  }
  return wordString + " Only";
}

// --- Invoice Calculations ---
const tbody = document.getElementById('items-tbody');
const addBtn = document.getElementById('add-item-btn');
const subtotalEl = document.getElementById('calc-subtotal');
const taxEl = document.getElementById('calc-tax');
const grandTotalEl = document.getElementById('calc-grand-total');
const amountWordsEl = document.getElementById('amount-words-display');
const gstRateSelect = document.getElementById('gst-rate');
const gstRateDisplay = document.getElementById('gst-rate-display');

function createRow(sno) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="sno-cell border-right text-center">${sno}</td>
    <td class="border-right"><textarea class="tally-input-borderless item-desc" rows="1" placeholder="Item Name"></textarea></td>
    <td class="border-right"><input type="text" class="tally-input-borderless item-hsn text-center" placeholder="HSN" /></td>
    <td class="border-right"><input type="number" class="tally-input-borderless item-gst-rate text-center" value="18" /></td>
    <td class="border-right"><input type="number" class="tally-input-borderless item-qty text-center" value="1" min="1" /></td>
    <td class="border-right"><input type="number" class="tally-input-borderless item-rate text-right" value="0" step="0.01" /></td>
    <td class="border-right">
      <select class="tally-input-borderless item-unit text-center">
        <option value="PCS" selected>PCS</option>
        <option value="NOS">NOS</option>
        <option value="KGS">KGS</option>
      </select>
    </td>
    <td class="border-right"><input type="number" class="tally-input-borderless item-disc text-center" value="0" /></td>
    <td class="item-amount text-right bold-tally">0.00</td>
    <td class="no-print text-right"><button class="danger-btn del-btn" title="Remove" style="padding:2px 4px;"><i data-lucide="x" style="width:14px;height:14px;"></i></button></td>
  `;
  return tr;
}

function updateCalculations() {
  let subtotal = 0;
  let totalQty = 0;
  
  // Tax breakdown map: { HSN: { taxable: 0, gstRate: 0 } }
  let hsnMap = {};
  
  const rows = tbody.querySelectorAll('tr');
  
  rows.forEach((row, index) => {
    row.querySelector('.sno-cell').textContent = index + 1;
    
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
    const disc = parseFloat(row.querySelector('.item-disc').value) || 0;
    const gstRateRow = parseFloat(row.querySelector('.item-gst-rate').value) || 0;
    const hsn = row.querySelector('.item-hsn').value || '-';
    
    let baseAmt = qty * rate;
    let discAmt = baseAmt * (disc / 100);
    let amount = baseAmt - discAmt;
    
    row.querySelector('.item-amount').textContent = amount.toFixed(2);
    subtotal += amount;
    totalQty += qty;
    
    if (!hsnMap[hsn]) {
      hsnMap[hsn] = { taxable: 0, gstRate: gstRateRow };
    }
    hsnMap[hsn].taxable += amount;
  });
  
  // Calculate Taxes
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  
  const companyGstin = document.getElementById('company-gstin').value || '';
  const clientState = document.getElementById('state-code').value || '';
  const isInterState = (companyGstin.substring(0,2) !== clientState.substring(0,2));
  
  const rowIgst = document.getElementById('row-igst');
  const rowCgst = document.getElementById('row-cgst');
  const rowSgst = document.getElementById('row-sgst');
  
  if (isInterState) {
    if (rowIgst) rowIgst.style.display = 'table-row';
    if (rowCgst) rowCgst.style.display = 'none';
    if (rowSgst) rowSgst.style.display = 'none';
  } else {
    if (rowIgst) rowIgst.style.display = 'none';
    if (rowCgst) rowCgst.style.display = 'table-row';
    if (rowSgst) rowSgst.style.display = 'table-row';
  }
  
  const taxBreakdownTbody = document.getElementById('tax-breakdown-tbody');
  taxBreakdownTbody.innerHTML = '';
  
  Object.keys(hsnMap).forEach(hsn => {
    let data = hsnMap[hsn];
    let halfRate = data.gstRate / 2;
    let fullRate = data.gstRate;
    
    let cGstAmt = 0;
    let sGstAmt = 0;
    let iGstAmt = 0;
    
    if (isInterState) {
      iGstAmt = data.taxable * (fullRate / 100);
    } else {
      cGstAmt = data.taxable * (halfRate / 100);
      sGstAmt = data.taxable * (halfRate / 100);
    }
    
    let totalTax = cGstAmt + sGstAmt + iGstAmt;
    
    totalCGST += cGstAmt;
    totalSGST += sGstAmt;
    totalIGST += iGstAmt;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border-right border-top text-center">${hsn}</td>
      <td class="border-right border-top text-right">${data.taxable.toFixed(2)}</td>
      <td class="border-right border-top text-center">${isInterState ? '0' : halfRate}%</td>
      <td class="border-right border-top text-right">${cGstAmt.toFixed(2)}</td>
      <td class="border-right border-top text-center">${isInterState ? '0' : halfRate}%</td>
      <td class="border-right border-top text-right">${sGstAmt.toFixed(2)}</td>
      <td class="border-top text-right">${totalTax.toFixed(2)}</td>
    `;
    taxBreakdownTbody.appendChild(tr);
  });
  
  const grandTotal = subtotal + totalCGST + totalSGST + totalIGST;
  
  // Update UI Elements
  document.getElementById('tally-total-qty').textContent = totalQty;
  document.getElementById('tally-igst-amt').textContent = totalIGST.toFixed(2);
  document.getElementById('tally-cgst-amt').textContent = totalCGST.toFixed(2);
  document.getElementById('tally-sgst-amt').textContent = totalSGST.toFixed(2);
  document.getElementById('tally-grand-total').textContent = grandTotal.toFixed(2);
  
  document.getElementById('tally-breakdown-taxable').textContent = subtotal.toFixed(2);
  document.getElementById('tally-breakdown-cgst').textContent = totalCGST.toFixed(2);
  document.getElementById('tally-breakdown-sgst').textContent = totalSGST.toFixed(2);
  document.getElementById('tally-breakdown-total-tax').textContent = (totalCGST + totalSGST + totalIGST).toFixed(2);
  
  const roundedGrand = Math.round(grandTotal);
  amountWordsEl.textContent = numberToWords(roundedGrand);
  document.getElementById('tax-words-display').textContent = numberToWords(Math.round(totalCGST + totalSGST + totalIGST));
}

// Ensure state change triggers calculation
document.getElementById('state-code').addEventListener('change', updateCalculations);
document.getElementById('state-code').addEventListener('input', updateCalculations);
document.getElementById('company-gstin').addEventListener('input', updateCalculations);

tbody.addEventListener('input', (e) => {
  if (e.target.classList.contains('item-qty') || e.target.classList.contains('item-rate') || e.target.classList.contains('item-disc') || e.target.classList.contains('item-gst-rate')) {
    updateCalculations();
  }
});
tbody.addEventListener('click', (e) => {
  const delBtn = e.target.closest('.del-btn');
  if (delBtn) {
    delBtn.closest('tr').remove();
    updateCalculations();
  }
});
gstRateSelect.addEventListener('change', (e) => {
  const val = e.target.value;
  document.querySelectorAll('.item-gst-rate').forEach(inp => inp.value = val);
  updateCalculations();
});

addBtn.addEventListener('click', () => {
  const rowCount = tbody.querySelectorAll('tr').length + 1;
  const newRow = createRow(rowCount);
  tbody.appendChild(newRow);
  lucide.createIcons({ root: newRow });
});

// Initialize with one row
const initRow = createRow(1);
tbody.appendChild(initRow);
lucide.createIcons({ root: initRow });
updateCalculations();

// --- Confetti Effect ---
function triggerConfetti() {
  var duration = 3 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    var particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

// --- Data Management (Local Storage) ---
function saveInvoice() {
  const invoiceNo = document.getElementById('invoice-no').value;
  const clientDetails = document.getElementById('client-name').value;
  const clientGstin = document.getElementById('client-gstin').value;
  const dateStr = document.getElementById('invoice-date').value;
  const stateCode = document.getElementById('state-code').value;
  const gstRate = document.getElementById('gst-rate').value;
  
  const grandTotal = parseFloat(document.getElementById('tally-grand-total').textContent.replace(/[^0-9.]/g, ''));
  
  if (!invoiceNo || !dateStr || grandTotal <= 0) {
    alert("Please ensure Invoice Number, Date, and at least one item with a rate is filled.");
    return;
  }
  
  const items = [];
  const rows = document.getElementById('items-tbody').querySelectorAll('tr');
  rows.forEach(row => {
    items.push({
      desc: row.querySelector('.item-desc').value,
      hsn: row.querySelector('.item-hsn').value,
      qty: row.querySelector('.item-qty').value,
      unit: row.querySelector('.item-unit').value,
      rate: row.querySelector('.item-rate').value
    });
  });
  
  const newInvoice = {
    id: Date.now().toString(),
    invoiceNo,
    client: clientDetails.split('\n')[0],
    clientFull: clientDetails,
    clientGstin,
    date: dateStr,
    stateCode,
    ewayBill: '',
    gstRate,
    items,
    total: grandTotal
  };
  
  let invoices = JSON.parse(localStorage.getItem('meera_invoices')) || [];
  invoices.push(newInvoice);
  localStorage.setItem('meera_invoices', JSON.stringify(invoices));
  
  // Trigger Success Celebration!
  triggerConfetti();
  
  // Auto-increment invoice number
  const match = invoiceNo.match(/(\\d+)$/);
  if (match) {
    const nextNum = parseInt(match[0], 10) + 1;
    document.getElementById('invoice-no').value = invoiceNo.replace(/\\d+$/, nextNum.toString().padStart(match[0].length, '0'));
  }
  
  updateDashboard();
  
  // Switch to dashboard view after a short delay
  setTimeout(() => {
    document.querySelector('.nav-btn[data-target="dashboard-view"]').click();
  }, 2000);
}

document.getElementById('save-invoice-btn').addEventListener('click', saveInvoice);

const filterMonthInput = document.getElementById('filter-month');
const filterYearInput = document.getElementById('filter-year');

function initializeFilters() {
  const d = new Date();
  const todayStr = d.toISOString().split('T')[0];
  const currentMonth = todayStr.substring(0, 7);
  const currentYear = todayStr.substring(0, 4);

  if (!filterMonthInput.value) {
    filterMonthInput.value = currentMonth;
  }

  const invoices = JSON.parse(localStorage.getItem('meera_invoices')) || [];
  let years = new Set([currentYear]);
  invoices.forEach(inv => {
    if (inv.date) years.add(inv.date.substring(0, 4));
  });

  const sortedYears = Array.from(years).sort().reverse();
  const existingVal = filterYearInput.value;
  filterYearInput.innerHTML = '';
  sortedYears.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    filterYearInput.appendChild(opt);
  });
  
  if (existingVal && sortedYears.includes(existingVal)) {
    filterYearInput.value = existingVal;
  } else {
    filterYearInput.value = currentYear;
  }
}

filterMonthInput.addEventListener('change', updateDashboard);
filterYearInput.addEventListener('change', updateDashboard);

function updateDashboard() {
  initializeFilters();
  const invoices = JSON.parse(localStorage.getItem('meera_invoices')) || [];
  
  let todayTotal = 0, monthTotal = 0, yearTotal = 0;
  
  const d = new Date();
  const todayStr = d.toISOString().split('T')[0];
  
  const selectedMonth = filterMonthInput.value;
  const selectedYear = filterYearInput.value;
  
  invoices.forEach(inv => {
    if (inv.date === todayStr) todayTotal += inv.total;
    if (inv.date.startsWith(selectedMonth)) monthTotal += inv.total;
    if (inv.date.startsWith(selectedYear)) yearTotal += inv.total;
  });
  
  const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  
  document.getElementById('stat-today').textContent = inrFormatter.format(todayTotal);
  document.getElementById('stat-month').textContent = inrFormatter.format(monthTotal);
  document.getElementById('stat-year').textContent = inrFormatter.format(yearTotal);
  
  const tableBody = document.getElementById('recent-invoices-body');
  tableBody.innerHTML = '';
  
  const recent = [...invoices].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  
  if (recent.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px; color: #64748b;">No invoices generated yet.</td></tr>`;
  } else {
    recent.forEach(inv => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${inv.invoiceNo}</strong></td>
        <td>${new Date(inv.date).toLocaleDateString('en-IN')}</td>
        <td>${inv.client}</td>
        <td class="text-right"><strong>${inrFormatter.format(inv.total)}</strong></td>
      `;
      tableBody.appendChild(tr);
    });
  }
}

document.getElementById('clear-data-btn').addEventListener('click', () => {
  if(confirm("Are you sure you want to completely clear all turnover data?")) {
    localStorage.removeItem('meera_invoices');
    updateDashboard();
  }
});

// --- Bank Details Persistence ---
const bankFields = ['bank-name', 'bank-account', 'bank-ifsc', 'bank-branch', 'company-phone', 'company-email', 'company-address'];
bankFields.forEach(field => {
  const el = document.getElementById(field);
  const savedVal = localStorage.getItem(`meera_${field}`);
  if (savedVal) el.value = savedVal;
  
  el.addEventListener('input', (e) => {
    localStorage.setItem(`meera_${field}`, e.target.value);
  });
});

// --- History & PDF Statement ---
function updateHistoryView(searchQuery = '') {
  const invoices = JSON.parse(localStorage.getItem('meera_invoices')) || [];
  const tableBody = document.getElementById('all-invoices-body');
  tableBody.innerHTML = '';
  
  const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  
  const filtered = invoices.filter(inv => 
    inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inv.client.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a,b) => new Date(b.date) - new Date(a.date));
  
  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: #64748b;">No invoices found.</td></tr>`;
  } else {
    filtered.forEach(inv => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${inv.invoiceNo}</strong></td>
        <td>${new Date(inv.date).toLocaleDateString('en-IN')}</td>
        <td>${inv.client}</td>
        <td class="text-right"><strong>${inrFormatter.format(inv.total)}</strong></td>
        <td style="text-align: center; white-space: nowrap;">
          <button class="primary-btn view-inv-btn" data-id="${inv.id}" title="View Invoice" style="padding: 6px; margin-right: 4px;"><i data-lucide="eye" style="width:16px;height:16px;"></i></button>
          <button class="danger-btn delete-inv-btn" data-id="${inv.id}" title="Delete Invoice"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    lucide.createIcons({ root: tableBody });
  }
}

document.getElementById('history-search').addEventListener('input', (e) => {
  updateHistoryView(e.target.value);
});

document.getElementById('all-invoices-body').addEventListener('click', (e) => {
  const delBtn = e.target.closest('.delete-inv-btn');
  const viewBtn = e.target.closest('.view-inv-btn');
  
  if (delBtn) {
    if(confirm("Are you sure you want to delete this specific invoice?")) {
      const id = delBtn.getAttribute('data-id');
      let invoices = JSON.parse(localStorage.getItem('meera_invoices')) || [];
      invoices = invoices.filter(inv => inv.id !== id);
      localStorage.setItem('meera_invoices', JSON.stringify(invoices));
      updateDashboard();
      updateHistoryView(document.getElementById('history-search').value);
    }
  }
  
  if (viewBtn) {
    const id = viewBtn.getAttribute('data-id');
    loadInvoice(id);
  }
});

function loadInvoice(id) {
  const invoices = JSON.parse(localStorage.getItem('meera_invoices')) || [];
  const inv = invoices.find(i => i.id === id);
  if(!inv) return;
  
  document.getElementById('invoice-no').value = inv.invoiceNo;
  document.getElementById('client-details').value = inv.clientFull || inv.client;
  document.getElementById('client-gstin').value = inv.clientGstin || "";
  document.getElementById('invoice-date').value = inv.date;
  if(inv.stateCode) document.getElementById('state-code').value = inv.stateCode;
  if(inv.ewayBill) document.getElementById('eway-bill').value = inv.ewayBill;
  if(inv.gstRate) document.getElementById('gst-rate').value = inv.gstRate;
  
  const tbody = document.getElementById('items-tbody');
  tbody.innerHTML = ''; 
  
  if(inv.items && inv.items.length > 0) {
    inv.items.forEach((item, idx) => {
      const tr = createRow(idx + 1);
      tr.querySelector('.item-desc').value = item.desc || '';
      tr.querySelector('.item-hsn').value = item.hsn || '';
      tr.querySelector('.item-qty').value = item.qty || '1';
      tr.querySelector('.item-unit').value = item.unit || 'PCS';
      tr.querySelector('.item-rate').value = item.rate || '0';
      tbody.appendChild(tr);
      lucide.createIcons({ root: tr });
    });
  } else {
    const initRow = createRow(1);
    tbody.appendChild(initRow);
    lucide.createIcons({ root: initRow });
  }
  
  updateCalculations();
  
  // Switch to Invoice View
  document.querySelector('.nav-btn[data-target="invoice-view"]').click();
}

document.getElementById('download-pdf-btn').addEventListener('click', () => {
  const fromDate = document.getElementById('statement-from').value;
  const toDate = document.getElementById('statement-to').value;
  
  if(!fromDate || !toDate) {
    alert("Please select both From Date and To Date.");
    return;
  }
  
  const invoices = JSON.parse(localStorage.getItem('meera_invoices')) || [];
  const filtered = invoices.filter(inv => {
    return inv.date >= fromDate && inv.date <= toDate;
  }).sort((a,b) => new Date(a.date) - new Date(b.date));
  
  if(filtered.length === 0) {
    alert("No turnover found in this date range.");
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setTextColor(245, 158, 11);
  doc.text("MEERA ENTERPRISES", 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text("Turnover Statement", 14, 28);
  doc.setFontSize(10);
  doc.text(`Period: ${new Date(fromDate).toLocaleDateString('en-IN')} to ${new Date(toDate).toLocaleDateString('en-IN')}`, 14, 34);
  
  const tableData = filtered.map((inv, index) => [
    index + 1,
    new Date(inv.date).toLocaleDateString('en-IN'),
    inv.invoiceNo,
    inv.client,
    "Rs. " + inv.total.toFixed(2)
  ]);
  
  const totalAmount = filtered.reduce((sum, inv) => sum + inv.total, 0);
  
  doc.autoTable({
    startY: 40,
    head: [['S.No', 'Date', 'Invoice No', 'Client', 'Total Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
    foot: [['', '', '', 'Total Turnover:', "Rs. " + totalAmount.toFixed(2)]],
    footStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: 'bold' }
  });
  
  doc.save(`Meera_Statement_${fromDate}_to_${toDate}.pdf`);
});

// Attach History Update to Nav
document.querySelector('.nav-btn[data-target="history-view"]').addEventListener('click', () => {
  updateHistoryView();
});

// --- Settings Logic ---
const changePassBtn = document.getElementById('change-password-btn');
const currentPassInput = document.getElementById('current-password');
const newPassInput = document.getElementById('new-password');
const confirmPassInput = document.getElementById('confirm-password');
const passMsg = document.getElementById('password-msg');

changePassBtn.addEventListener('click', () => {
  const currentPass = currentPassInput.value;
  const newPass = newPassInput.value;
  const confirmPass = confirmPassInput.value;
  const actualCurrent = localStorage.getItem('admin_password');
  
  if (!currentPass || !newPass || !confirmPass) {
    passMsg.textContent = 'All fields are required.';
    passMsg.style.color = 'var(--danger)';
    return;
  }
  
  if (currentPass !== actualCurrent) {
    passMsg.textContent = 'Current password is incorrect.';
    passMsg.style.color = 'var(--danger)';
    return;
  }
  
  if (newPass !== confirmPass) {
    passMsg.textContent = 'New passwords do not match.';
    passMsg.style.color = 'var(--danger)';
    return;
  }
  
  if (newPass.length < 6) {
    passMsg.textContent = 'Password must be at least 6 characters.';
    passMsg.style.color = 'var(--danger)';
    return;
  }
  
  localStorage.setItem('admin_password', newPass);
  passMsg.textContent = 'Password updated successfully!';
  passMsg.style.color = 'var(--emerald)';
  
  currentPassInput.value = '';
  newPassInput.value = '';
  confirmPassInput.value = '';
  
  setTimeout(() => {
    passMsg.textContent = '';
  }, 3000);
});

updateDashboard();
