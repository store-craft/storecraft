import { select } from "@inquirer/prompts";

export const platforms = [
  {
    name: 'node',
    value: 'node',
  },
  {
    name: 'bun',
    value: 'bun',
  },
  {
    name: 'deno',
    value: 'deno',
  },
  {
    name: 'cloudflare workers',
    value: 'cloudflare-workers',
  },
  {
    name: 'AWS Lambda (API Gateway)',
    value: 'aws-lambda',
  },
  {
    name: 'Google Functions',
    value: 'google-functions',
  },
]

export const collect_platform = async () => {

  const id = await select(
    {
      message: '🌐 Select a platform to run the store',
      choices: platforms,
      loop: true,
    }
  );

  console.log('platform ', id)

  return {
    type: 'platform',
    id: id,
    config: {
    }
  };
}