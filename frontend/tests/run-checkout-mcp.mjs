import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { createInterface } from "node:readline"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const cli = process.argv[2]
assert.ok(
  cli,
  "Usage: node tests/run-checkout-mcp.mjs <installed-playwright-mcp-cli.js>"
)
const artifacts = resolve("test-results/checkout")
await mkdir(artifacts, { recursive: true })
const server = spawn(
  process.execPath,
  [
    cli,
    "--browser",
    "chrome",
    "--headless",
    "--isolated",
    "--output-dir",
    artifacts,
  ],
  { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] }
)
const lines = createInterface({ input: server.stdout })
const pending = new Map()
let sequence = 0
let stderr = ""
server.stderr.on("data", (chunk) => {
  stderr += chunk.toString()
})
lines.on("line", (line) => {
  let message
  try {
    message = JSON.parse(line)
  } catch {
    return
  }
  const callback = pending.get(message.id)
  if (callback) {
    pending.delete(message.id)
    clearTimeout(callback.timeout)
    if (message.error) callback.reject(new Error(JSON.stringify(message.error)))
    else callback.resolve(message.result)
  }
})
server.on("error", (error) => {
  for (const callback of pending.values()) callback.reject(error)
})
server.on("exit", (code) => {
  for (const callback of pending.values())
    callback.reject(new Error(`MCP exited ${code}: ${stderr}`))
})
function request(method, params) {
  const id = ++sequence
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`MCP timeout: ${method}`))
    }, 90000)
    pending.set(id, { resolve, reject, timeout })
    server.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`
    )
  })
}

try {
  await request("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "matcha-isolated-browser-test", version: "1.0.0" },
  })
  server.stdin.write(
    `${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`
  )
  const available = await request("tools/list", {})
  assert.ok(
    available.tools.some((tool) => tool.name === "browser_run_code_unsafe"),
    "MCP must expose Playwright code execution"
  )
  const code = (await readFile("tests/checkout.browser.mjs", "utf8")).replace(
    "export default async function",
    "async function"
  )
  const result = await request("tools/call", {
    name: "browser_run_code_unsafe",
    arguments: { code },
  })
  if (result.isError)
    throw new Error(result.content.map((entry) => entry.text ?? "").join("\n"))
  const text = result.content
    .filter((entry) => entry.type === "text")
    .map((entry) => entry.text)
    .join("\n")
  const match = text.match(/### Result\s*\n([\s\S]*?)(?=\n### |$)/)
  assert.ok(match, "MCP must return a structured test report")
  const report = {
    ...JSON.parse(match[1]),
    isolated: true,
    mcpProcessId: server.pid,
  }
  await writeFile(
    resolve(artifacts, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`
  )
  console.log(JSON.stringify(report, null, 2))
  assert.equal(report.failure, undefined, report.failure?.message)
} finally {
  lines.close()
  server.stdin.end()
  server.kill()
  for (const callback of pending.values()) clearTimeout(callback.timeout)
}
