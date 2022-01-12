import chokidar from 'chokidar';
import liveServer from 'live-server';
import { exec } from 'node:child_process';

const build = async () => {
  return new Promise((resolve, reject) => {
    exec('npm run build:rebuild', (error, stdout, stderr) => {
      if (error) {
        reject([error, stdout, stderr]);
        return;
      }
      resolve([stdout, stderr]);
    });
  });
};

const run = async () => {
  try {
    const [out, err] = await build();
    console.log(`${out}`);
    console.log(`${err}`);

    liveServer.start(params);

    // One-liner for current directory
    chokidar.watch('src').on('change', (path, stats) => {
      console.log(stats?.mtime, path);
      build();
    });
  } catch (err) {
    console.log('Error building', err);
  }
};

const params = {
  port: 3000, // Set the server port. Defaults to 8080.
  root: 'dist', // Set root directory that's being served. Defaults to cwd.
  open: false, // When false, it won't load your browser by default.
  // ignore: 'scss,my/templates', // comma-separated string for paths to ignore
  // file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
  // wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
  logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
};

run();
