import spaceImport from 'contentful-import'
import { createClient } from 'contentful-management'

import { getContext } from '../../context'
import { confirmation } from '../../utils/actions'
import { handleAsyncError as handle } from '../../utils/async'
import { log } from '../../utils/log'
import normalizer from '../../utils/normalizer'
import { highlightStyle } from '../../utils/styles'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'

import blog from '../../seeds/blog.js'

const seeds = {
  blog
}

export const command = 'seed'
export const desc = 'Seed a content model and content based on given templates'

export const builder = (yargs) => {
  return yargs
    .example('contentful space seed --template blog')
    .demandCommand(2)
    .option('template', {
      alias: 't',
      describe: 'The template to apply on your Space',
      demandOption: true,
      choices: Object.keys(seeds)
    })
    .option('spaceId', {
      alias: 's',
      describe: 'ID of the Space to seed the data to'
    })
}

export async function spaceSeed (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)
  const { spaceId } = await normalizer(argv)
  const { cmaToken } = await getContext()

  const client = createClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)

  log(`You are about import the ${highlightStyle(argv.template)} template to your ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}) space. Existing content might be overwritten.`)

  const confirm = await confirmation('Do you want to apply the changes to your space?')

  if (confirm) {
    await spaceImport({
      content: seeds[argv.template],
      spaceId,
      managementToken: cmaToken
    })
    return
  }
  log(`Seeding data aborted by user.`)
}

export const handler = handle(spaceSeed)