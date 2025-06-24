const WebSocket = require('ws');

function startBinanceTradesWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws/binance-trades' });

  wss.on('connection', (ws) => {
    // Connect to Binance public WebSocket for BTCUSDT trades
    const binanceWS = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

    binanceWS.on('message', (data) => {
      // Forward trade data to frontend client
      ws.send(data.toString());
    });

    binanceWS.on('close', () => {
      ws.close();
    });

    ws.on('close', () => {
      binanceWS.close();
    });
  });
}

module.exports = startBinanceTradesWebSocket; 