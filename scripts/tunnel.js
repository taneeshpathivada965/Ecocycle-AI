const localtunnel = require('localtunnel');
const { spawn } = require('child_process');

const PORT = 5000;
let tunnelInstance = null;

async function startLocalTunnel() {
  try {
    console.log(`[TUNNEL] Establishing resilient public tunnel on port ${PORT}...`);
    const tunnel = await localtunnel({
      port: PORT,
      subdomain: 'ecocycle-ai-' + Math.floor(1000 + Math.random() * 9000)
    });

    tunnelInstance = tunnel;
    console.log('\n==================================================');
    console.log(`>>> ECOCYCLE AI PUBLIC URL IS LIVE:`);
    console.log(`>>> ${tunnel.url}`);
    console.log('==================================================\n');

    // Keepalive ping every 15s to prevent idle disconnect
    const pingInterval = setInterval(async () => {
      try {
        await fetch(`${tunnel.url}/api/health`, {
          headers: { 'bypass-tunnel-reminder': 'true' }
        });
      } catch (e) {
        // Ping error ignored
      }
    }, 15000);

    tunnel.on('close', () => {
      console.log('[TUNNEL] Tunnel closed. Reconnecting in 3 seconds...');
      clearInterval(pingInterval);
      setTimeout(startLocalTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('[TUNNEL] Error:', err.message);
      clearInterval(pingInterval);
      setTimeout(startLocalTunnel, 3000);
    });
  } catch (err) {
    console.error('[TUNNEL] Failed to establish tunnel, retrying in 4s:', err.message);
    setTimeout(startLocalTunnel, 4000);
  }
}

// Start persistent SSH tunnel to localhost.run in parallel with ServerAliveInterval to ensure zero disconnects
function startSshTunnel() {
  const ssh = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=5',
    '-R', `80:localhost:${PORT}`,
    'nokey@localhost.run'
  ]);

  ssh.stdout.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.lhr\.life/);
    if (match) {
      console.log(`[SSH TUNNEL] Zero-splash Public URL: ${match[0]}`);
    }
  });

  ssh.on('close', () => {
    console.log('[SSH TUNNEL] Disconnected. Restarting in 3s...');
    setTimeout(startSshTunnel, 3000);
  });
}

startLocalTunnel();
startSshTunnel();
