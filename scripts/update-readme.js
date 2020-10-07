#!/usr/bin/env node
import { join } from 'path';
import execa from 'execa';
import { GraphQLClient } from 'graphql-request';

const rootPath = join(__dirname, '..')

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
    join(rootPath, './README.template.md'),
    join(rootPath, './README.md'),
    '--gh_repos_count', repositories.totalCount
  ], { cwd: rootPath, preferLocal: true })
})()