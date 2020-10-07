#!/usr/bin/env node
const path = require('path')
const execa = require('execa')
const { GraphQLClient } = require('graphql-request')

const rootPath = path.join(__dirname, '..')

;(async() => {
  const gitHubClient = new GraphQLClient('https://api.github.com/graphql', {
    headers: {
      Authorization: `bearer ${process.env.GH_ACCESS_TOKEN}`,
    },
    method: 'POST'
  })

  const gitHubResponse = await gitHubClient.request(`
    {
      viewer {
        login
        repositories(privacy: PUBLIC, ownerAffiliations: OWNER, isFork: true) {
          totalCount
        }
      }
    }
  `)

  const { viewer: { repositories } } = gitHubResponse
  
  await execa('untoken', [
    path.join(rootPath, './README.template.md'),
    path.join(rootPath, './README.md'),
    '--gh_repos_count', repositories.totalCount
  ], { cwd: rootPath, preferLocal: true })
})()