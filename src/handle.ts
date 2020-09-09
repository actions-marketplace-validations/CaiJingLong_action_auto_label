import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks'

export async function run(githubToken: string): Promise<void> {
  try {
    if (github.context.eventName !== 'issues') {
      return
    }
    core.info(`The run token = '${githubToken}'`)

    const payload = github.context
      .payload as Webhooks.EventPayloads.WebhookPayloadIssues

    core.info(`Hello world`)
    const username = core.getInput('user_name')
    core.info(`Hello ${username}`)

    core.info(`username === admin : ${username === 'admin'}`)

    core.info(`event name = ${github.context.eventName}`)

    const octokit = github.getOctokit(githubToken)

    const {owner, repo} = github.context.repo
    const issue_number = payload.issue.number
    const regex = /\[([^\]]+)\]/g
    const array = regex.exec(payload.issue.title)
    if (array == null) {
      core.info(
        `没有找到标签, 回复一下: owner: ${owner}, repo = ${repo}, issue_number = ${issue_number}`
      )
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number,
        body: `没有找到[xxx]类型的标签`
      })
      return
    }

    const labelName = array[1]
    core.info(`预计的标签名: labelname is = ${labelName}`)

    const allLabels = await octokit.issues.listLabelsForRepo({
      owner,
      repo
    })

    const labelText = allLabels.data
      .map<string>(data => {
        return data.name
      })
      .join(',')

    core.info(`找到了一堆标签 ${labelText}`)

    let haveResult = false

    for (const label of allLabels.data) {
      const labels = [label.name]
      if (labelName.toUpperCase() === label.name.toUpperCase()) {
        core.info('找到了标签')
        await octokit.issues.addLabels({
          owner,
          repo,
          issue_number,
          labels
        })
        haveResult = true
        break
      }
    }

    if (!haveResult) {
      core.info(`没找到标签 ${labelName}`)
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number,
        body: `没有找到 ${labelName}`
      })
    }

    core.info('run success')
  } catch (error) {
    core.error('The action run error:')
    core.error(error)
    core.setFailed(error.message)
  }
}
