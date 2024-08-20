# aws-lambda

First, install the `aws-cli`, [instruction](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

Next, install `cdk`

```zsh
npm install -g aws-cdk
```

Now, init

```zsh
mkdir app
cd app
cdk init app -l typescript
```

Add this to your `tsconfig.json`
```json
{
  "allowJs": true,
}

```