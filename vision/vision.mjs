import { spawn } from "child_process";
import fs from "fs";

const COUNT_BUFFER = 5;
const FRAME_INTERVAL = 30_000;

const OUTPUT_FILE = process.env.VISION_OUTPUT_FILE || "/vision/kitecount.json";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapOutputPrefix(prefix, output) {
  return output.toString().split("\n").map((line) => `${prefix}: ${line}`).join("\n");
}

async function exec(cmd, args) {
  const child = spawn(cmd, args);
  const stdout = [];

  child.stdout.on("data", (data) => {
    console.log(mapOutputPrefix(cmd, data));
    stdout.push(data);
  });

  child.stderr.on("data", (data) => {
    console.error(mapOutputPrefix(cmd, data));
  });

  return new Promise((resolve, reject) => {
    child.on("close", (code) => {
      console.log(`${cmd} exited with code ${code}`);
      if (code === 0) {
        resolve({ code, stdout: stdout.join("") });
      } else {
        reject(new Error(`${cmd} failed with code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

class KiteCounter {
  constructor() {
    this.recentCounts = [];
  }

  observe(count) {
    this.recentCounts.push(count);
    if (this.recentCounts.length > COUNT_BUFFER) {
      this.recentCounts.shift();
    }
  }

  average() {
    const avg = this.recentCounts.reduce((a, b) => a + b, 0) / this.recentCounts.length;
    console.log("New average:", avg);
    return avg;
  }

  writeAverage() {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ khaya: Math.round(this.average()) }));
  }

  async countKites() {
    // later: ffmpeg -i https://conjure.co.za/blouberg/hls/media.m3u8 -ss 2 -frames:v 1 frame.jpg
    await exec("ffmpeg", ["-i", "https://conjure.co.za/blouberg/hls/media.m3u8", "-ss", "2", "-frames:v", "1", "/tmp/frame.jpg"]);
    const { stdout } = await exec("darknet", ["detect", "cfg/yolov2-tiny.cfg", "yolov2-tiny.weights", "/tmp/frame.jpg"]);
    fs.unlinkSync("/tmp/frame.jpg");
    return stdout.split("\n").filter((line) => line.includes("kite")).length;
  }

  async run() {
    let count = 0;

    try {
      count = await this.countKites();
    } catch (e) {
      console.error("Failed to count kites:", e);
    }

    this.observe(count);
    this.writeAverage();
  }
}

(async () => {
  const kiteCounter = new KiteCounter();
  while (true) {
    await kiteCounter.run();
    await sleep(FRAME_INTERVAL);
  }
})();
