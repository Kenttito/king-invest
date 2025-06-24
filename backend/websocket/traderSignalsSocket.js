const { demoTraders } = require('../routes/traderSignals');
const WebSocket = require('ws');

function randomSignal() {
  const actions = ['Buy', 'Sell'];
  const symbols = ['BTCUSD', 'ETHUSD', 'EURUSD'];
  const priceMap = {
    BTCUSD: () => 60000 + Math.floor(Math.random() * 10000),
    ETHUSD: () => 3000 + Math.floor(Math.random() * 1000),
    EURUSD: () => (1.05 + Math.random() * 0.05).toFixed(4)
  };
  const action = actions[Math.floor(Math.random() * actions.length)];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const price = priceMap[symbol]();
  const now = new Date();
  const time = now.toISOString().replace('T', ' ').substring(0, 16);
  return { action, symbol, price, time };
}

function startTraderSignalsWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws/trader-signals' });

  wss.on('connection', (ws) => {
    // Send current signals on connect
    demoTraders.forEach(trader => {
      ws.send(JSON.stringify({ name: trader.name, roi: trader.roi, signal: trader.signal }));
    });
  });

  // Every 10 seconds, update a random trader's signal and broadcast
  setInterval(() => {
    const idx = Math.floor(Math.random() * demoTraders.length);
    const newSignal = randomSignal();
    demoTraders[idx].signal = newSignal;
    const update = { name: demoTraders[idx].name, roi: demoTraders[idx].roi, signal: newSignal };
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(update));
      }
    });
  }, 10000);
}

module.exports = startTraderSignalsWebSocket; 