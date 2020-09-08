import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    core.info(`Hello world`)
    const username = core.getInput('username')
    core.info(`input username = ${username}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
