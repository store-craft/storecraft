import { select } from "@inquirer/prompts";

/** @satisfies {import("../../utils.js").Choice[]} */
export const choices = /** @type {const} */ ([
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
]);

export const collect_platform = async () => {

  const id = await select(
    {
      message: '🌐 Select a platform to run the store',
      choices,
      loop: true,
    }
  );

  return {
    type: 'platform',
    id: id,
    config: {
    }
  };
}