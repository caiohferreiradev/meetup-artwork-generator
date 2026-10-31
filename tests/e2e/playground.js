const { runCLI } = require('@wp-playground/cli');
const { mkdtemp, cp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const pluginPath = 'meetup-artwork-generator/meetup-artwork-generator.php';

async function startPlayground() {
  const dir = await mkdtemp(path.join(tmpdir(), 'meetup-artwork-e2e-'));
  try {
    for (const file of ['meetup-artwork-generator.php', 'includes', 'templates', 'assets', 'languages']) {
      await cp(path.join(root, file), path.join(dir, file), { recursive: true });
    }
    const server = await runCLI({
      command: 'server', port: 0, workers: 1,
      wp: process.env.WP_VERSION || '6.5.14', php: process.env.PHP_VERSION || '7.4',
      'mount-before-install': [{ hostPath: dir, vfsPath: '/wordpress/wp-content/plugins/meetup-artwork-generator' }],
      blueprint: { steps: [
        { step: 'runPHP', code: `<?php
          require '/wordpress/wp-load.php';
          $page = wp_insert_post(array('post_title' => 'Original front page', 'post_status' => 'publish', 'post_type' => 'page'));
          update_option('show_on_front', 'page');
          update_option('page_on_front', $page);
        ` },
        { step: 'activatePlugin', pluginPath },
      ] },
    });
    return { ...server, async close() { try { await server[Symbol.asyncDispose](); } finally { await rm(dir, { recursive: true, force: true }); } } };
  } catch (error) {
    await rm(dir, { recursive: true, force: true });
    throw error;
  }
}

module.exports = { startPlayground };
