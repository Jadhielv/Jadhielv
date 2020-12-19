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

  const gitHubResponseForks = await gitHubClient.request(`
    {
      viewer {
        login
        repositories(privacy: PUBLIC, ownerAffiliations: OWNER, isFork: true) {
          totalCount
        }
      }
    }
  `)

  const gitHubResponseSources = await gitHubClient.request(`
    {
      viewer {
        login
        repositories(first:1, privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
          edges {
            node {
                name
                url
            }
          }
        }
      }
    }
  `)

  const { viewer: { repositories } } = gitHubResponseForks
  const { viewer: { repositories: { edges: [node] } } } = gitHubResponseSources
  
  await execa('untoken', [
    path.join(rootPath, './README.template.md'),
    path.join(rootPath, './README.md'),
    '--gh_repos_count', repositories.totalCount,
    '--gh_repo_name', node.name,
    '--gh_repo_url', node.url
  ], { cwd: rootPath, preferLocal: true })
})()