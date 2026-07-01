// Service Worker — runs in background even when tab is minimized
let cutoffData = [];
let firedAlerts = new Set();

// Receive cut-off data from the main dashboard
self.addEventListener('message', event => {
  if(event.data.type === 'UPDATE_CUTOFFS'){
    cutoffData = event.data.data;
    checkCutoffs();
  }
});

function nowAU(){
  return new Date(new Date().toLocaleString('en-US', {timeZone:'Australia/Sydney'}));
}

function checkCutoffs(){
  cutoffData.forEach(item => {
    if(!item.cutoffTime) return;
    const now = nowAU();
    const [h, m] = item.cutoffTime.split(':').map(Number);
    const cutoff = nowAU();
    cutoff.setHours(h, m, 0, 0);
    const diff = (cutoff - now) / 60000;
    const alertKey = `${item.memberId}-${item.supplierName}-${item.cutoffTime}`;

    if(diff >= 0 && diff <= 30 && !firedAlerts.has(alertKey)){
      firedAlerts.add(alertKey);
      self.registration.showNotification('⚠️ Cut-off Alert!', {
        body: `${item.memberName} — ${item.supplierName} cut-off in ${Math.round(diff)} min${Math.round(diff)===1?'':'s'}!`,
        requireInteraction: true,
        tag: alertKey,
        icon: 'https://cdn.jsdelivr.net/npm/twemoji@14/assets/72x72/26a0.png',
        badge: 'https://cdn.jsdelivr.net/npm/twemoji@14/assets/72x72/26a0.png',
        vibrate: [300, 100, 300, 100, 300]
      });
    }

    // Reset so it can fire again next day
    if(diff < 0 || diff > 30) firedAlerts.delete(alertKey);
  });
}

// Check every 30 seconds even when tab is in background
setInterval(checkCutoffs, 30000);

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window'}).then(clientList => {
    if(clientList.length > 0) clientList[0].focus();
  }));
});
