import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks'

async function run(): Promise<void> {
  try {
    if (github.context.eventName === 'issues') {
      return
    }

    const payload = github.context
      .payload as Webhooks.EventPayloads.WebhookPayloadIssues

    core.info(`Hello world`)
    const username = core.getInput('user_name')
    core.info(`Hello ${username}`)

    core.info(`username === admin : ${username === 'admin'}`)

    core.info(`event name = ${github.context.eventName}`)

    const token = core.getInput('GITHUB_TOKEN')

    const octokit = github.getOctokit(token)

    const {owner, repo} = github.context.repo
    const issue_number = payload.issue.id
    const regex = /\[([^\]]+)\]/g
    const array = regex.exec(payload.issue.title)
    if (array == null) {
      octokit.issues.createComment({
        owner,
        repo,
        issue_number,
        body: `没有找到[xxx]类型的标签`
      })
      return
    }

    const labelName = array[1]
    core.info(`labelname is = ${labelName}`)

    const allLabels = await octokit.issues.listLabelsForRepo({
      owner,
      repo
    })
    let haveResult = false

    for (const label of allLabels.data) {
      const labels = [label.name]
      if (labelName.toUpperCase() === label.name.toUpperCase()) {
        octokit.issues.addLabels({
          owner,
          repo,
          issue_number,
          labels
        })
        haveResult = true
      }
    }

    if (!haveResult) {
      octokit.issues.createComment({
        owner,
        repo,
        issue_number,
        body: `没有找到 ${labelName}`
      })
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
